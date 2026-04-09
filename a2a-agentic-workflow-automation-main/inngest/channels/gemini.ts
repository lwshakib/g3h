import { channel, topic } from "@inngest/realtime";

export const geminiChannel = channel("gemini-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    workflowId?: string;
    status: "loading" | "success" | "error";
  }>()
);

