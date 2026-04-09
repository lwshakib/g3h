import { NodeExecutor } from "./../type";
import { NodeType } from "@/generated/prisma/enums";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "@/features/executions/components/http-request/executor";
import { geminiExecutor } from "@/features/executions/components/gemini/executor";
import { anthropicExecutor } from "@/features/executions/components/anthropic/executor";
import { openaiExecutor } from "@/features/executions/components/openai/executor";
import { discordExecutor } from "@/features/executions/components/discord/executor";
import { slackExecutor } from "@/features/executions/components/slack/executor";
import { tavilyExecutor } from "@/features/executions/components/tavily/executor";
import type {
  NodeDataMap,
  GoogleFormTriggerNodeData,
  StripeTriggerNodeData,
} from "../node-data-types";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";

export const executorRegistry: {
  [K in NodeType]: NodeExecutor<NodeDataMap[K]>;
} = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FROM_TRIGGER]:
    googleFormTriggerExecutor as NodeExecutor<GoogleFormTriggerNodeData>,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openaiExecutor,
  [NodeType.STRIPE_TRIGGER]:
    stripeTriggerExecutor as NodeExecutor<StripeTriggerNodeData>,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
  [NodeType.TAVILY]: tavilyExecutor,
} as const;

export function getExecutor<T extends NodeType>(
  type: T
): NodeExecutor<NodeDataMap[T]> {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor as NodeExecutor<NodeDataMap[T]>;
}
