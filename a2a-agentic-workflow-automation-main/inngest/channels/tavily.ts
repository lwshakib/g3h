import { channel, topic } from "@inngest/realtime";

export const tavilyChannel = channel("tavily-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    workflowId?: string;
    status: "loading" | "success" | "error";
  }>()
);

