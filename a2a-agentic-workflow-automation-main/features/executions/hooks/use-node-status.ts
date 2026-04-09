import type { Realtime } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useEffect, useState } from "react";
import { useWorkflowStore } from "@/context";

import type { NodeStatus } from "@/components/react-flow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.Token>;
}

export function useNodeStatus({
  nodeId,
  channel,
  topic,
  refreshToken,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial");
  const executionTrigger = useWorkflowStore((state) => state.executionTrigger);

  // Reset status to initial when execution trigger changes (new execution started)
  useEffect(() => {
    setStatus("initial");
    console.log(`[useNodeStatus] Reset status to initial for node ${nodeId} (execution trigger: ${executionTrigger})`);
  }, [executionTrigger, nodeId]);

  const { data, error } = useInngestSubscription({
    refreshToken,
    enabled: true,
  });

  useEffect(() => {
    console.log(`[useNodeStatus] Hook state for node ${nodeId}:`, {
      dataLength: data?.length || 0,
      error,
      channel,
      topic,
    });
  }, [data, error, nodeId, channel, topic]);

  useEffect(() => {
    if (!data?.length) return;

    const filteredMessages = data.filter(
      (msg) =>
        msg.kind === "data" &&
        msg.channel === channel &&
        msg.topic === topic &&
        msg.data.nodeId === nodeId
    );

    if (filteredMessages.length > 0) {
      const latestMessage = filteredMessages.sort((a, b) => {
        if (a.kind === "data" && b.kind === "data") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      })[0];

      if (latestMessage?.kind === "data") {
        const newStatus = latestMessage.data.status as NodeStatus;
        console.log(
          `[useNodeStatus] Updating status for node ${nodeId}:`,
          newStatus
        );
        setStatus(newStatus);
      }
    } else {
      console.log(
        `[useNodeStatus] No messages found for node ${nodeId}, channel: ${channel}, topic: ${topic}`
      );
      console.log(
        `[useNodeStatus] Available messages:`,
        data.map((msg) => ({
          kind: msg.kind,
          channel: msg.channel,
          topic: msg.topic,
          nodeId: msg.kind === "data" ? msg.data?.nodeId : undefined,
        }))
      );
    }
  }, [data, nodeId, channel, topic]);

  return status;
}
