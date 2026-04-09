import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";

import { BaseTriggerNode } from "../base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchStripeTriggerRealtimeToken } from "./actions";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export const StripeTriggerNode = memo(function StripeTriggerNode(
  props: NodeProps
) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = stripeTriggerChannel().name;
  console.log(
    `[StripeTriggerNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchStripeTriggerRealtimeToken,
  });

  console.log(
    `[StripeTriggerNode] Node ${props.id} current status:`,
    nodeStatus
  );

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={"/logos/stripe.svg"}
        name="When Stripe event occurs"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

StripeTriggerNode.displayName = "StripeTriggerNode";

