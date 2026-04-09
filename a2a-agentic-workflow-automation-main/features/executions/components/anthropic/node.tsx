"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../base-execution-node";
import { AnthropicDialog } from "./dialog";
import type { AnthropicNodeData } from "@/features/executions/node-data-types";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchAnthropicRealtimeToken } from "./actions";
import { anthropicChannel } from "@/inngest/channels/anthropic";

export const AnthropicNode = memo(function AnthropicNode(props: NodeProps) {
  const { data } = props;
  const typedData = data as AnthropicNodeData | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = anthropicChannel().name;
  console.log(
    `[AnthropicNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  console.log(`[AnthropicNode] Node ${props.id} current status:`, nodeStatus);

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
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        initialData={typedData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        status={nodeStatus}
        name="Anthropic"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";

