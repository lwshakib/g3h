"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../base-execution-node";
import { SlackDialog } from "./dialog";
import type { SlackNodeData } from "@/features/executions/node-data-types";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchSlackRealtimeToken } from "./actions";
import { slackChannel } from "@/inngest/channels/slack";

export const SlackNode = memo(function SlackNode(props: NodeProps) {
  const { data } = props;
  const typedData = data as SlackNodeData | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = slackChannel().name;
  console.log(
    `[SlackNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  });

  console.log(`[SlackNode] Node ${props.id} current status:`, nodeStatus);

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
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        initialData={typedData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/slack.svg"
        status={nodeStatus}
        name="Slack"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

SlackNode.displayName = "SlackNode";

