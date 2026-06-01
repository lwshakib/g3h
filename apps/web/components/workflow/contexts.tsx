"use client"

import * as React from "react"
import type { NodeRunStatus } from "./types"

export interface SelectorContextValue {
  openSelector: (sourceNodeId?: string, mode?: "all" | "executions") => void
  openNodeEditor: (
    nodeId: string,
    label: string,
    kind: "Trigger" | "Execution"
  ) => void
  getNodeStatus: (nodeId: string) => NodeRunStatus
  connectingFromNodeId: string | null
}

export const SelectorContext = React.createContext<SelectorContextValue | null>(
  null
)

export interface EdgeActionsContextValue {
  onEdgeInsert: (edgeId: string, source: string, target: string) => void
  onEdgeDelete: (edgeId: string) => void
}

export const EdgeActionsContext =
  React.createContext<EdgeActionsContextValue | null>(null)
