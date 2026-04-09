"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../base-execution-node";
import { DiscordDialog } from "./dialog";
import type { DiscordNodeData } from "@/features/executions/node-data-types";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchDiscordRealtimeToken } from "./actions";
import { discordChannel } from "@/inngest/channels/discord";

export const DiscordNode = memo(function DiscordNode(props: NodeProps) {
  const { data } = props;
  const typedData = data as DiscordNodeData | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = discordChannel().name;
  console.log(
    `[DiscordNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchDiscordRealtimeToken,
  });

  console.log(`[DiscordNode] Node ${props.id} current status:`, nodeStatus);

  const description = typedData?.message
    ? typedData.message.length > 50
      ? `${typedData.message.substring(0, 50)}...`
      : typedData.message
    : "Not configured";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        initialData={typedData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/discord.svg"
        status={nodeStatus}
        name="Discord"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

DiscordNode.displayName = "DiscordNode";

