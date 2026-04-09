import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";

import { BaseTriggerNode } from "../base-trigger-node";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchManualTriggerRealtimeToken } from "./actions";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

export const ManualTriggerNode = memo(function ManualTriggerNode(
  props: NodeProps
) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const channelName = manualTriggerChannel().name;
  console.log(
    `[ManualTriggerNode] Node ${props.id} subscribing to channel: ${channelName}, topic: status`
  );

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken: fetchManualTriggerRealtimeToken,
  });

  console.log(`[ManualTriggerNode] Node ${props.id} current status:`, nodeStatus);

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
