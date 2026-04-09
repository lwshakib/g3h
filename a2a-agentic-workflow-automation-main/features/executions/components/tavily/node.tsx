"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../base-execution-node";
import { TavilyDialog } from "./dialog";
import type { TavilyNodeData } from "@/features/executions/node-data-types";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchTavilyRealtimeToken } from "./actions";
import { tavilyChannel } from "@/inngest/channels/tavily";

export const TavilyNode = memo(function TavilyNode(props: NodeProps) {
  const { data } = props;
  const typedData = data as TavilyNodeData | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = tavilyChannel().name;
  console.log(
    `[TavilyNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchTavilyRealtimeToken,
  });

  console.log(`[TavilyNode] Node ${props.id} current status:`, nodeStatus);

  const description = typedData?.query
    ? typedData.query.length > 50
      ? `${typedData.query.substring(0, 50)}...`
      : typedData.query
    : "Not configured";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <TavilyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        initialData={typedData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/tavily.svg"
        status={nodeStatus}
        name="Tavily"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

TavilyNode.displayName = "TavilyNode";

