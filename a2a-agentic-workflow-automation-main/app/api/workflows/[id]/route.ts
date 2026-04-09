import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
} from "@/actions/workflow";
import { workflowIdSchema, updateWorkflowSchema } from "@/validators/workflow";

// GET /api/workflows/[id] - Get a single workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate workflow ID
    const { id } = await params;

    // Call action
    const result = await getWorkflowById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch workflow" },
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

    return NextResponse.json({ workflow: result.workflow });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid workflow ID" },
        { status: 400 }
      );
    }
    console.error("Error fetching workflow:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

// PATCH /api/workflows/[id] - Update a workflow
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate workflow ID
    const { id } = await params;
    const validatedParams = workflowIdSchema.parse({ id });

    const body = await request.json();

    // Validate request body
    const validatedData = updateWorkflowSchema.parse(body);

    // Call action
    const result = await updateWorkflow(validatedParams.id, validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update workflow" },
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

    return NextResponse.json({ workflow: result.workflow });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows/[id] - Delete a workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate workflow ID
    const { id } = await params;
    const validatedParams = workflowIdSchema.parse({ id });

    // Call action
    const result = await deleteWorkflow(validatedParams.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete workflow" },
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

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid workflow ID" },
        { status: 400 }
      );
    }
    console.error("Error deleting workflow:", error);
    return NextResponse.json(
      { error: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
