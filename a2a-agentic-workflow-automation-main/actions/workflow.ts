"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@/actions/user";
import { revalidatePath } from "next/cache";
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  type CreateWorkflowInput,
  type UpdateWorkflowInput,
} from "@/validators/workflow";
import { z } from "zod";
import { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

const ITEMS_PER_PAGE = 10;

export async function getWorkflows(page: number = 1, search?: string) {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: "Unauthorized",
      workflows: [],
      totalPages: 0,
      total: 0,
    };
  }

  try {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const where: { userId: string; name?: { contains: string; mode: "insensitive" } } = {
      userId: user.id,
    };

    if (search && search.trim()) {
      where.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: ITEMS_PER_PAGE,
        skip: offset,
      }),
      prisma.workflow.count({ where }),
    ]);

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return {
      success: true,
      workflows,
      totalPages,
      total,
    };
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch workflows",
      workflows: [],
      totalPages: 0,
      total: 0,
    };
  }
}

export async function getWorkflowById(workflowId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", workflow: null };
  }

  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: user.id,
      },
      include: {
        nodes: true,
        connections: true,
      },
    });

    if (!workflow) {
      return { success: false, error: "Workflow not found", workflow: null };
    }

    const nodes: Node[] = workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position as { x: number; y: number },
      data: node.data as Record<string, unknown>,
    }));

    const edges: Edge[] = workflow.connections.map((connection) => ({
      id: connection.id,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      sourceHandle: connection.sourceOutput,
      targetHandle: connection.targetInput,
    }));

    return {
      success: true,
      workflow: {
        ...workflow,
        nodes,
        edges,
      },
    };
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch workflow",
      workflow: null,
    };
  }
}

export async function createWorkflow(data: CreateWorkflowInput) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", workflow: null };
  }

  try {
    // Validate input
    const validatedData = createWorkflowSchema.parse(data);

    const workflow = await prisma.workflow.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        description: validatedData.description || "",
        nodes: {
          create: {
            name: "Initial",
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            data: {},
          },
        },
      },
    });

    revalidatePath("/workflows");
    return { success: true, workflow };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
        workflow: null,
      };
    }
    console.error("Error creating workflow:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create workflow",
      workflow: null,
    };
  }
}

export async function updateWorkflow(
  workflowId: string,
  data: UpdateWorkflowInput
) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", workflow: null };
  }

  try {
    // Validate input
    const validatedData = updateWorkflowSchema.parse(data);

    const workflow = await prisma.workflow.update({
      where: {
        id: workflowId,
        userId: user.id,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description || "",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/workflows");
    revalidatePath(`/workflows/${workflowId}`);
    return { success: true, workflow };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
        workflow: null,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Workflow not found", workflow: null };
    }
    console.error("Error updating workflow:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update workflow",
      workflow: null,
    };
  }
}

export async function deleteWorkflow(workflowId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const workflow = await prisma.workflow.delete({
      where: {
        id: workflowId,
        userId: user.id,
      },
    });

    revalidatePath("/workflows");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Workflow not found" };
    }
    console.error("Error deleting workflow:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete workflow",
    };
  }
}

export async function duplicateWorkflow(workflowId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", workflow: null };
  }

  try {
    const result = await getWorkflowById(workflowId);
    if (!result.success || !result.workflow) {
      return { success: false, error: "Workflow not found", workflow: null };
    }

    const newWorkflow = await prisma.workflow.create({
      data: {
        userId: user.id,
        name: `${result.workflow.name} (Copy)`,
        description: result.workflow.description,
      },
    });

    revalidatePath("/workflows");
    return { success: true, workflow: newWorkflow };
  } catch (error) {
    console.error("Error duplicating workflow:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to duplicate workflow",
      workflow: null,
    };
  }
}

export async function saveWorkflowNodesAndConnections(
  workflowId: string,
  nodes: Node[],
  edges: Edge[]
) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify workflow belongs to user
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: user.id,
      },
    });

    if (!workflow) {
      return { success: false, error: "Workflow not found" };
    }

    // Delete all existing nodes and connections (cascade will handle connections)
    await prisma.node.deleteMany({
      where: { workflowId },
    });

    // Create nodes
    const nodeMap = new Map<string, string>(); // React Flow ID -> Database ID
    for (const node of nodes) {
      const nodeName =
        (node.data?.name as string | undefined) || node.type || "Node";
      const dbNode = await prisma.node.create({
        data: {
          workflowId,
          name: nodeName,
          type: (node.type as NodeType) || NodeType.INITIAL,
          position: (node.position || { x: 0, y: 0 }) as object,
          data: (node.data || {}) as object,
        },
      });
      nodeMap.set(node.id, dbNode.id);
    }

    // Create connections
    for (const edge of edges) {
      const sourceNodeId = nodeMap.get(edge.source);
      const targetNodeId = nodeMap.get(edge.target);

      if (sourceNodeId && targetNodeId) {
        await prisma.connection.create({
          data: {
            workflowId,
            sourceNodeId,
            targetNodeId,
            sourceOutput: edge.sourceHandle || "source-1",
            targetInput: edge.targetHandle || "target-1",
          },
        });
      }
    }

    // Update workflow updatedAt timestamp
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/workflows");
    revalidatePath(`/workflows/${workflowId}`);
    return { 
      success: true,
      nodeIdMapping: Object.fromEntries(nodeMap), // React Flow ID -> Database ID
    };
  } catch (error) {
    console.error("Error saving workflow nodes and connections:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save workflow nodes and connections",
    };
  }
}