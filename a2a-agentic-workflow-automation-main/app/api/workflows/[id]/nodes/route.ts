import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveWorkflowNodesAndConnections } from "@/actions/workflow";
import { workflowIdSchema } from "@/validators/workflow";
import { Node, Edge } from "@xyflow/react";

const saveWorkflowSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

// POST /api/workflows/[id]/nodes - Save workflow nodes and connections
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
    const validatedData = saveWorkflowSchema.parse(body);

    // Call action
    const result = await saveWorkflowNodesAndConnections(
      validatedParams.id,
      validatedData.nodes as Node[],
      validatedData.edges as Edge[]
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error || "Failed to save workflow nodes and connections",
        },
        {
          status:
            result.error === "Unauthorized"
              ? 401
              : result.error === "Workflow not found"
              ? 404
              : 400,
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Error saving workflow nodes and connections:", error);
    return NextResponse.json(
      { error: "Failed to save workflow nodes and connections" },
      { status: 500 }
    );
  }
}
