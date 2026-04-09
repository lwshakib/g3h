"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../base-execution-node";
import { OpenAIDialog } from "./dialog";
import type { OpenAINodeData } from "@/features/executions/node-data-types";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAIRealtimeToken } from "./actions";
import { openaiChannel } from "@/inngest/channels/openai";

export const OpenAINode = memo(function OpenAINode(props: NodeProps) {
  const { data } = props;
  const typedData = data as OpenAINodeData | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = openaiChannel().name;
  console.log(
    `[OpenAINode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchOpenAIRealtimeToken,
  });

  console.log(`[OpenAINode] Node ${props.id} current status:`, nodeStatus);

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
      <OpenAIDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        initialData={typedData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        status={nodeStatus}
        name="OpenAI"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

OpenAINode.displayName = "OpenAINode";

