import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";

import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchGoogleFormTriggerRealtimeToken } from "./actions";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

export const GoogleFormTriggerNode = memo(function GoogleFormTriggerNode(
  props: NodeProps
) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = googleFormTriggerChannel().name;
  console.log(
    `[GoogleFormTriggerNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchGoogleFormTriggerRealtimeToken,
  });

  console.log(
    `[GoogleFormTriggerNode] Node ${props.id} current status:`,
    nodeStatus
  );

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={"/logos/google-form.svg"}
        name="When Google Form is submitted"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GoogleFormTriggerNode.displayName = "GoogleFormTriggerNode";
