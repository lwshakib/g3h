import { channel, topic } from "@inngest/realtime";

export const discordChannel = channel("discord-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    workflowId?: string;
    status: "loading" | "success" | "error";
  }>()
);

