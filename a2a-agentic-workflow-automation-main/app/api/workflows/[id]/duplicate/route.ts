import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { duplicateWorkflow } from "@/actions/workflow";
import { workflowIdSchema } from "@/validators/workflow";

// POST /api/workflows/[id]/duplicate - Duplicate a workflow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate workflow ID
    const { id } = await params;
    const validatedParams = workflowIdSchema.parse({ id });

    // Call action
    const result = await duplicateWorkflow(validatedParams.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to duplicate workflow" },
        {
          status:
            result.error === "Unauthorized"
              ? 401
              : result.error === "Workflow not found"
                ? 404
                : 500,
        }
      );
    }

    return NextResponse.json({ workflow: result.workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid workflow ID" },
        { status: 400 }
      );
    }
    console.error("Error duplicating workflow:", error);
    return NextResponse.json(
      { error: "Failed to duplicate workflow" },
      { status: 500 }
    );
  }
}

