"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@/actions/user";
import { revalidatePath } from "next/cache";
import { ExecutionStatus } from "@/generated/prisma/enums";
import {
  InputJsonValue,
  NullableJsonNullValueInput,
} from "@/generated/prisma/internal/prismaNamespace";

export async function getExecutions(workflowId?: string, page: number = 1, limit: number = 20) {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: "Unauthorized",
      executions: [],
      pagination: {
        page: 1,
        limit,
        totalPages: 0,
        total: 0,
      },
    };
  }

  try {
    const where: {
      workflow: {
        userId: string;
      };
      workflowId?: string;
    } = {
      workflow: {
        userId: user.id,
      },
    };

    if (workflowId) {
      where.workflowId = workflowId;
    }

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.execution.count({ where }),
    ]);

    return {
      success: true,
      executions,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  } catch (error) {
    console.error("Error fetching executions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch executions",
      executions: [],
      pagination: {
        page: 1,
        limit,
        totalPages: 0,
        total: 0,
      },
    };
  }
}

export async function getExecutionById(executionId: string) {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: "Unauthorized",
      execution: null,
    };
  }

  try {
    const execution = await prisma.execution.findFirst({
      where: {
        id: executionId,
        workflow: {
          userId: user.id,
        },
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!execution) {
      return {
        success: false,
        error: "Execution not found",
        execution: null,
      };
    }

    return {
      success: true,
      execution,
    };
  } catch (error) {
    console.error("Error fetching execution:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch execution",
      execution: null,
    };
  }
}

export async function createExecution(
  workflowId: string,
  triggerType?: string,
  userId?: string
) {
  // If userId is provided (e.g., from Inngest context), use it directly
  // Otherwise, get it from current user (for API routes)
  let userIdToUse: string;

  if (userId) {
    userIdToUse = userId;
  } else {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized", execution: null };
    }
    userIdToUse = user.id;
  }

  try {
    // Verify workflow exists and belongs to user
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: userIdToUse,
      },
    });

    if (!workflow) {
      return {
        success: false,
        error: "Workflow not found",
        execution: null,
      };
    }

    const execution = await prisma.execution.create({
      data: {
        workflowId,
        status: ExecutionStatus.RUNNING,
        triggerType: triggerType || "manual",
      },
    });

    revalidatePath("/executions");
    return { success: true, execution };
  } catch (error) {
    console.error("Error creating execution:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create execution",
      execution: null,
    };
  }
}

export async function updateExecution(
  executionId: string,
  data: {
    status?: ExecutionStatus;
    error?: string;
    result?: NullableJsonNullValueInput | InputJsonValue;
    completedAt?: Date;
  },
  userId?: string
) {
  // If userId is provided (e.g., from Inngest context), use it directly
  // Otherwise, get it from current user (for API routes)
  let userIdToUse: string;

  if (userId) {
    userIdToUse = userId;
  } else {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized", execution: null };
    }
    userIdToUse = user.id;
  }

  try {
    // Verify execution exists and belongs to user
    const existing = await prisma.execution.findFirst({
      where: {
        id: executionId,
        workflow: {
          userId: userIdToUse,
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Execution not found",
        execution: null,
      };
    }

    const execution = await prisma.execution.update({
      where: {
        id: executionId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/executions");
    revalidatePath(`/executions/${executionId}`);
    return { success: true, execution };
  } catch (error) {
    console.error("Error updating execution:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update execution",
      execution: null,
    };
  }
}

