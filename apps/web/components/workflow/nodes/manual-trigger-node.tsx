"use client"

import * as React from "react"
import {
  Handle,
  Position,
  type NodeProps,
  useReactFlow,
  useStore,
} from "@xyflow/react"
import { MousePointerIcon, PlusIcon } from "lucide-react"
import type { WorkflowNodeData } from "../types"
import { TRIGGER_NODE_BORDER_STYLE } from "../types"
import { isNodeConfigured, deleteNodeAndConnections } from "../utils"
import { NodeConfigIndicator, NodeStatusBorder } from "../panels"
import { NodeTopToolbar } from "../edges"
import { SelectorContext } from "../contexts"

export function ManualTriggerNode({ id, data }: NodeProps) {
  const { setNodes, setEdges, getNodes } = useReactFlow()
  const ctx = React.useContext(SelectorContext)
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id
  const edges = useStore((state) => state.edges)
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  )
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection
  const runStatus = ctx?.getNodeStatus(id) ?? "initial"
  const configured = isNodeConfigured("manualTrigger", data as WorkflowNodeData)

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() =>
        ctx?.openNodeEditor(id, (data as WorkflowNodeData).label, "Trigger")
      }
    >
      <NodeTopToolbar
        onDelete={() =>
          deleteNodeAndConnections(id, setNodes, setEdges, getNodes)
        }
      />
      <div className="flex items-center justify-center">
        <div
          className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-border bg-card shadow-sm"
          style={TRIGGER_NODE_BORDER_STYLE}
        >
          <NodeStatusBorder status={runStatus} />
          <MousePointerIcon className="size-11 stroke-[1.8] text-muted-foreground" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />

          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-border !bg-muted !shadow-none"
          />

          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute top-1/2 right-[-50px] h-px w-[34px] -translate-y-1/2 bg-border" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute top-1/2 right-[-76px] flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] leading-[1.08] font-medium tracking-[-0.01em] text-foreground">
          When clicking &lsquo;Execute workflow&rsquo;
        </p>
      )}
    </div>
  )
}
