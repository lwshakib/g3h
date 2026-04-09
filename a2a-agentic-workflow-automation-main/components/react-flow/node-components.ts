import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { OpenAINode } from "@/features/executions/components/openai/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { SlackNode } from "@/features/executions/components/slack/node";
import { TavilyNode } from "@/features/executions/components/tavily/node";
import { NodeType } from "@/generated/prisma/enums";
import { InitialNode } from "./initial-node";
import { NodeProps } from "@xyflow/react";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
export const NodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.GOOGLE_FROM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.OPENAI]: OpenAINode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.TAVILY]: TavilyNode,
} as const satisfies Record<NodeType, React.ComponentType<NodeProps>>;

export type RegisteredNodeTypes = keyof typeof NodeComponents;
