import { channel, topic } from "@inngest/realtime";

export const anthropicChannel = channel("anthropic-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    workflowId?: string;
    status: "loading" | "success" | "error";
  }>()
);

