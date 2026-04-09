"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "../base-execution-node";
import { HttpRequestDialog } from "./dialog";
import type { HttpRequestNodeData } from "@/features/executions/node-data-types";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchHttpRequestRealtimeToken } from "./actions";
import { httpRequestChannel } from "@/inngest/channels/http-request";

export const HttpRequestNode = memo(function HttpRequestNode(props: NodeProps) {
  const { data } = props;
  const typedData = data as HttpRequestNodeData | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = httpRequestChannel().name;
  console.log(
    `[HttpRequestNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchHttpRequestRealtimeToken,
  });

  console.log(`[HttpRequestNode] Node ${props.id} current status:`, nodeStatus);

  const description = typedData?.endpoint
    ? `${typedData.method ?? "GET"}: ${typedData.endpoint}`
    : "Not configured";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        initialData={typedData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        status={nodeStatus}
        name="HTTP Request"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
