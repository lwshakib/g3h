import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveWorkflowNodesAndConnections } from "@/actions/workflow";
import { workflowIdSchema } from "@/validators/workflow";
import { createExecution } from "@/actions/execution";
import { Node, Edge } from "@xyflow/react";
import { inngest } from "@/inngest/client";

const executeWorkflowSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

// POST /api/workflows/[id]/execute - Save workflow and trigger execution
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Validate workflow ID
    const validatedParams = workflowIdSchema.parse({ id });

    const body = await request.json();

    // Validate request body
    const validatedData = executeWorkflowSchema.parse(body);

    // First, save the workflow nodes and connections
    const saveResult = await saveWorkflowNodesAndConnections(
      validatedParams.id,
      validatedData.nodes as Node[],
      validatedData.edges as Edge[]
    );

    if (!saveResult.success) {
      return NextResponse.json(
        {
          error:
            saveResult.error || "Failed to save workflow nodes and connections",
        },
        {
          status:
            saveResult.error === "Unauthorized"
              ? 401
              : saveResult.error === "Workflow not found"
              ? 404
              : 400,
        }
      );
    }

    // Create reverse mapping: Database ID -> React Flow ID
    const dbToReactFlowIdMap: Record<string, string> = {};
    if (saveResult.nodeIdMapping) {
      for (const [reactFlowId, dbId] of Object.entries(
        saveResult.nodeIdMapping
      )) {
        dbToReactFlowIdMap[dbId] = reactFlowId;
      }
    }

    // Create execution record
    const executionResult = await createExecution(
      validatedParams.id,
      "manual"
    );

    if (!executionResult.success || !executionResult.execution) {
      return NextResponse.json(
        {
          error: executionResult.error || "Failed to create execution record",
        },
        { status: 500 }
      );
    }

    // Send event to Inngest to execute the workflow
    await inngest.send({
      name: "workflows/execute",
      data: {
        workflowId: validatedParams.id,
        nodeIdMapping: dbToReactFlowIdMap, // Database ID -> React Flow ID
        triggerType: "manual",
        executionId: executionResult.execution.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Workflow execution started",
      executionId: executionResult.execution.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Error executing workflow:", error);
    return NextResponse.json(
      { error: "Failed to execute workflow" },
      { status: 500 }
    );
  }
}
