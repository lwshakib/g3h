"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../base-execution-node";
import { GeminiDialog } from "./dialog";
import type { GeminiNodeData } from "@/features/executions/node-data-types";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGeminiRealtimeToken } from "./actions";
import { geminiChannel } from "@/inngest/channels/gemini";

export const GeminiNode = memo(function GeminiNode(props: NodeProps) {
  const { data } = props;
  const typedData = data as GeminiNodeData | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = geminiChannel().name;
  console.log(
    `[GeminiNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  console.log(`[GeminiNode] Node ${props.id} current status:`, nodeStatus);

  const description = typedData?.prompt
    ? typedData.prompt.length > 50
      ? `${typedData.prompt.substring(0, 50)}...`
      : typedData.prompt
    : "Not configured";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        initialData={typedData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        status={nodeStatus}
        name="Gemini"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";

