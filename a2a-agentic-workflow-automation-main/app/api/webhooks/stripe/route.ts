import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { createExecution } from "@/actions/execution";

// POST /api/webhooks/stripe?workflowId=xxx
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

    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Parse the event
    let event: {
      id: string;
      type: string;
      data: unknown;
      created: number;
      livemode: boolean;
      api_version: string | null;
      request: { id: string | null; idempotency_key: string | null } | null;
    };
    try {
      event = JSON.parse(body);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Note: For production, you should verify the webhook signature using Stripe's webhook secret
    // You can get the webhook secret from Stripe Dashboard > Developers > Webhooks > Your endpoint > Signing secret
    // Example verification (requires installing 'stripe' package):
    // import Stripe from 'stripe';
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    // try {
    //   stripe.webhooks.constructEvent(body, signature, webhookSecret);
    // } catch (err) {
    //   return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    // }

    // Create nodeIdMapping: Database ID -> Database ID
    const nodeIdMapping: Record<string, string> = {};
    for (const node of workflow.nodes) {
      nodeIdMapping[node.id] = node.id;
    }

    // Transform the Stripe event to match the expected format
    // The event data will be available as `stripeEvent` in the workflow context
    // Variables accessible in workflow:
    // - {{stripeEvent.id}} - Event ID
    // - {{stripeEvent.type}} - Event type (e.g., "payment_intent.succeeded")
    // - {{stripeEvent.data}} - Event data object
    // - {{stripeEvent.created}} - Event timestamp
    const initialData = {
      stripeEvent: {
        id: event.id,
        type: event.type,
        data: event.data,
        created: event.created,
        livemode: event.livemode,
        api_version: event.api_version,
        request: event.request,
      },
    };

    // Create execution record
    const executionResult = await createExecution(
      workflowId,
      "stripe",
      workflow.userId
    );

    // Send event to Inngest to execute the workflow
    await inngest.send({
      name: "workflows/execute",
      data: {
        workflowId,
        nodeIdMapping,
        initialData,
        triggerType: "stripe",
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

    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

