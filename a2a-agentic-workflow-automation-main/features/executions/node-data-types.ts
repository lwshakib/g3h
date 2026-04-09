import { NodeType } from "@/generated/prisma/enums";

export interface HttpRequestNodeData {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  body?: string | Record<string, unknown>;
  headers?: string | Record<string, string>; // Can be JSON string or object
  variableName?: string; // Variable name to store the response (e.g., "users")
  [key: string]: unknown; // Index signature for compatibility with Node data
}

export interface ManualTriggerNodeData {
  // Manual trigger doesn't need any specific data
  [key: string]: unknown;
}

export interface InitialNodeData {
  // Initial node doesn't need any specific data
  [key: string]: unknown;
}

export interface GoogleFormTriggerNodeData {
  // Google Form trigger doesn't need any specific data
  [key: string]: unknown;
}

export interface GeminiNodeData {
  prompt: string;
  credentialId?: string; // ID of the credential to use
  model?: string; // Optional model override (defaults to gemini-2.5-flash)
  variableName?: string; // Variable name to store the response
  [key: string]: unknown;
}

export interface AnthropicNodeData {
  prompt: string;
  credentialId?: string; // ID of the credential to use
  model?: string; // Optional model override (defaults to claude-3-5-sonnet-20241022)
  variableName?: string; // Variable name to store the response
  [key: string]: unknown;
}

export interface OpenAINodeData {
  prompt: string;
  credentialId?: string; // ID of the credential to use
  model?: string; // Optional model override (defaults to gpt-4o)
  variableName?: string; // Variable name to store the response
  [key: string]: unknown;
}

export interface StripeTriggerNodeData {
  // Stripe trigger doesn't need any specific data
  [key: string]: unknown;
}

export interface DiscordNodeData {
  credentialId?: string; // ID of the credential to use (Discord bot token)
  channelId?: string; // Discord channel ID
  message?: string; // Message content
  variableName?: string; // Variable name to store the response
  [key: string]: unknown;
}

export interface SlackNodeData {
  credentialId?: string; // ID of the credential to use (Slack webhook URL or bot token)
  channel?: string; // Slack channel name or ID
  message?: string; // Message content
  variableName?: string; // Variable name to store the response
  [key: string]: unknown;
}

export interface TavilyNodeData {
  credentialId?: string; // ID of the credential to use (Tavily API key)
  query?: string; // Search query
  maxResults?: number; // Maximum number of results (default: 5)
  variableName?: string; // Variable name to store the response
  [key: string]: unknown;
}

// Map NodeType to its corresponding data type
export type NodeDataMap = {
  [NodeType.HTTP_REQUEST]: HttpRequestNodeData;
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNodeData;
  [NodeType.INITIAL]: InitialNodeData;
  [NodeType.GOOGLE_FROM_TRIGGER]: GoogleFormTriggerNodeData;
  [NodeType.GEMINI]: GeminiNodeData;
  [NodeType.ANTHROPIC]: AnthropicNodeData;
  [NodeType.OPENAI]: OpenAINodeData;
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNodeData;
  [NodeType.DISCORD]: DiscordNodeData;
  [NodeType.SLACK]: SlackNodeData;
  [NodeType.TAVILY]: TavilyNodeData;
};

// Helper type to get node data type from NodeType
export type NodeDataByType<T extends NodeType> = NodeDataMap[T];
