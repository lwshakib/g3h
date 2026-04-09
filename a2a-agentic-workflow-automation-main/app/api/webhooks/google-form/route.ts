import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { createExecution } from "@/actions/execution";

// Schema for Google Form webhook payload (based on the Apps Script)
const googleFormPayloadSchema = z.object({
  formId: z.string(),
  formTitle: z.string(),
  responseId: z.string(),
  timestamp: z.union([z.string(), z.date()]),
  respondentEmail: z.string().optional(),
  responses: z.record(z.string(), z.unknown()),
});

// POST /api/webhooks/google-form?workflowId=xxx
export async function POST(request: NextRequest) {
  try {
    // Get workflowId from query params
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { error: "workflowId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        connections: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedPayload = googleFormPayloadSchema.parse(body);

    // Create nodeIdMapping: Database ID -> Database ID (since we don't have React Flow IDs)
    // This is needed for the executor to publish status updates
    // For webhook-triggered executions, we'll use database IDs as both keys and values
    const nodeIdMapping: Record<string, string> = {};
    for (const node of workflow.nodes) {
      nodeIdMapping[node.id] = node.id;
    }

    // Transform the Google Form payload to match the expected format
    // The form data will be available as `googleForm` in the workflow context
    // Variables accessible in workflow:
    // - {{googleForm.respondentEmail}} - Respondent's email
    // - {{googleForm.responses['Question Name']}} - Specific answer by question title
    // - {{googleForm.responses}} - All responses (automatically JSON stringified if object)
    // - {{googleForm.formId}}, {{googleForm.formTitle}}, {{googleForm.responseId}}, {{googleForm.timestamp}}
    const initialData = {
      googleForm: {
        formId: validatedPayload.formId,
        formTitle: validatedPayload.formTitle,
        responseId: validatedPayload.responseId,
        timestamp:
          validatedPayload.timestamp instanceof Date
            ? validatedPayload.timestamp.toISOString()
            : validatedPayload.timestamp,
        respondentEmail: validatedPayload.respondentEmail || undefined,
        // responses is an object where keys are question titles and values are answers
        // Example: { "What is your name?": "John Doe", "Email": "john@example.com" }
        responses: validatedPayload.responses,
      },
    };

    // Create execution record
    const executionResult = await createExecution(
      workflowId,
      "google-form",
      workflow.userId
    );

    // Send event to Inngest to execute the workflow
    await inngest.send({
      name: "workflows/execute",
      data: {
        workflowId,
        nodeIdMapping,
        initialData,
        triggerType: "google-form",
        executionId: executionResult.execution?.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Workflow execution started",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    console.error("Error processing Google Form webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
