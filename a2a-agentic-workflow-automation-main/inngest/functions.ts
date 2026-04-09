import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { Node, Edge } from "@xyflow/react";
import prisma from "@/lib/prisma";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import type { NodeDataMap } from "@/features/executions/node-data-types";
import { NodeType } from "@/generated/prisma/enums";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { geminiChannel } from "./channels/gemini";
import { anthropicChannel } from "./channels/anthropic";
import { openaiChannel } from "./channels/openai";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { tavilyChannel } from "./channels/tavily";

interface ExecuteWorkflowEvent {
  workflowId: string;
  nodes?: Node[];
  edges?: Edge[];
  nodeIdMapping?: Record<string, string>; // Database ID -> React Flow ID
  triggerType?: string; // e.g., "manual", "webhook", "stripe", "google-form"
  executionId?: string; // Optional execution ID if created before workflow execution
  initialData?: Record<string, unknown>; // Initial context data
}

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute",
    channels: [httpRequestChannel(), manualTriggerChannel(), googleFormTriggerChannel(), geminiChannel(), anthropicChannel(), openaiChannel(), stripeTriggerChannel(), discordChannel(), slackChannel(), tavilyChannel()],
  },
  async ({ event, step, publish }) => {
    const { workflowId, triggerType, executionId } = event.data as ExecuteWorkflowEvent;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is required");
    }

    const { userId, sortedNodes, execution } = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      // Create or use existing execution record
      let execution;
      if (executionId) {
        execution = await prisma.execution.findUnique({
          where: { id: executionId },
        });
      }

      if (!execution) {
        execution = await prisma.execution.create({
          data: {
            workflowId,
            status: ExecutionStatus.RUNNING,
            triggerType: triggerType || "manual",
          },
        });
      }

      return {
        userId: workflow.userId,
        sortedNodes: topologicalSort(workflow.nodes, workflow.connections),
        execution,
      };
    });

    let context = event.data.initialData || {};
    let httpRequestIndex = 0;
    const nodeIdMapping = event.data.nodeIdMapping || {}; // Database ID -> React Flow ID

    try {
      for (const node of sortedNodes) {
      const executor = getExecutor(node.type);

      // Type-safe data extraction based on node type
      let nodeData =
        (node.data as NodeDataMap[typeof node.type]) ||
        ({} as NodeDataMap[typeof node.type]);

      // Auto-generate variable name for HTTP requests if not provided
      if (node.type === NodeType.HTTP_REQUEST) {
        const httpData = nodeData as NodeDataMap[typeof NodeType.HTTP_REQUEST];
        if (!httpData.variableName?.trim()) {
          // Import generateVariableName dynamically to avoid circular dependency
          const { generateVariableName } = await import(
            "@/features/executions/lib/variable-parser"
          );
          // Create new object with generated variable name
          nodeData = {
            ...httpData,
            variableName: generateVariableName(node.id, httpRequestIndex),
          } as NodeDataMap[typeof node.type];
          httpRequestIndex++;
        } else {
          httpRequestIndex++;
        }
      }

      // Use React Flow node ID for publishing (for UI subscription), fallback to database ID
      const reactFlowNodeId = nodeIdMapping[node.id] || node.id;

      if (nodeIdMapping[node.id]) {
        console.log(
          `[Functions] Mapped database node ID ${node.id} to React Flow ID ${reactFlowNodeId}`
        );
      } else {
        console.log(
          `[Functions] No mapping found for node ${node.id}, using database ID`
        );
      }

      context = await executor({
        data: nodeData,
        context,
        nodeId: reactFlowNodeId, // Use React Flow ID for publishing
        step,
        publish,
        userId, // Pass userId for credential lookup
      });
    }

    // Clean up context: remove any internal fields
    const cleanedContext: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(context)) {
      // Skip internal fields
      if (key === "allHttpResponses") {
        continue;
      }

      // Data is already stored directly, so just copy it
      cleanedContext[key] = value;
    }

      // Update execution record with success status
      await step.run("update-execution-success", async () => {
        await prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.SUCCESS,
            result: cleanedContext as object,
            completedAt: new Date(),
          },
        });
      });

      return {
        workflowId,
        executionId: execution.id,
        context: cleanedContext,
      };
    } catch (error) {
      // Update execution record with error status
      await step.run("update-execution-error", async () => {
        await prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.ERROR,
            error: error instanceof Error ? error.message : "Workflow execution failed",
            completedAt: new Date(),
          },
        });
      });
      // Re-throw the error so Inngest can handle it
      throw error;
    }
  }
);

// Error handler to update execution status on failure
// Note: Inngest automatically handles errors, but we need to catch them in the main function
// For now, we'll handle errors within the main function using try-catch
