"use client"

import * as React from "react"
import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  type WorkflowNodeData,
  type NodeRunStatus,
  type WorkflowEditorProps,
  EDGE_TYPE,
  defaultInitialNodes,
  defaultInitialEdges,
  triggerNodeOptions,
  executionNodeOptions,
  nodeOptions,
} from "./types"
import {
  getUnconfiguredNodes,
  getExpressionPaths,
  appendExpression,
} from "./utils"

export function useWorkflowEditor({
  initialNodes = defaultInitialNodes,
  initialEdges = defaultInitialEdges,
  onWorkflowChange,
  onExecuteWorkflow,
}: Partial<WorkflowEditorProps>) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const colorMode = (mounted
    ? resolvedTheme === "dark"
      ? "dark"
      : "light"
    : undefined) as "dark" | "light" | undefined
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectorOpen, setSelectorOpen] = React.useState(false)
  const [selectorMode, setSelectorMode] = React.useState<"all" | "executions">(
    "all"
  )
  const [pendingSourceNodeId, setPendingSourceNodeId] = React.useState<
    string | null
  >(null)
  const [pendingEdgeInsert, setPendingEdgeInsert] = React.useState<{
    edgeId: string
    source: string
    target: string
  } | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [lastExecutedAt, setLastExecutedAt] = React.useState<string | null>(
    null
  )
  const [isExecuting, setIsExecuting] = React.useState(false)
  const [nodeStatuses, setNodeStatuses] = React.useState<
    Record<string, NodeRunStatus>
  >({})
  const [executionStatuses, setExecutionStatuses] = React.useState<
    Array<{
      nodeId: string
      label: string
      status: "running" | "success" | "error" | "skipped"
      message?: string
      statusCode?: number
      output?: string
      errorDetails?: {
        source?: string
        code?: number
        fullMessage?: string
        request?: {
          method?: string
          url?: string
          headers?: Record<string, string>
          body?: string | null
        }
      }
    }>
  >([])
  const [nodeErrorDetails, setNodeErrorDetails] = React.useState<
    Record<
      string,
      {
        source?: string
        code?: number
        fullMessage?: string
        request?: {
          method?: string
          url?: string
          headers?: Record<string, string>
          body?: string | null
        }
      }
    >
  >({})
  const [connectingFromNodeId, setConnectingFromNodeId] = React.useState<
    string | null
  >(null)
  const [nodeEditor, setNodeEditor] = React.useState<{
    isOpen: boolean
    nodeId: string | null
    kind: "Trigger" | "Execution"
    nodeType: string | null
    value: string
    method: string
    url: string
    inputSample: string
    outputSample: string
    sendQueryParams: boolean
    queryParamsMode: "fields" | "json"
    queryParamsSpecifierType: "fixed" | "expression"
    queryParamsJson: string
    queryParamsJsonType: "fixed" | "expression"
    queryParams: Array<{
      id: string
      name: string
      value: string
      valueType: "fixed" | "expression"
    }>
    sendHeaders: boolean
    headersMode: "fields" | "json"
    headersSpecifierType: "fixed" | "expression"
    headersJson: string
    headersJsonType: "fixed" | "expression"
    headers: Array<{
      id: string
      name: string
      value: string
      valueType: "fixed" | "expression"
    }>
    sendBody: boolean
    bodyMode: "fields" | "json"
    bodySpecifierType: "fixed" | "expression"
    bodyJson: string
    bodyJsonType: "fixed" | "expression"
    bodyFields: Array<{
      id: string
      name: string
      value: string
      valueType: "fixed" | "expression"
    }>
  }>({
    isOpen: false,
    nodeId: null,
    kind: "Execution",
    nodeType: null,
    value: "",
    method: "GET",
    url: "",
    inputSample: '{\n  "key": "value"\n}',
    outputSample: "",
    sendQueryParams: false,
    queryParamsMode: "fields",
    queryParamsSpecifierType: "fixed",
    queryParamsJson: "",
    queryParamsJsonType: "fixed",
    queryParams: [
      {
        id: `qp-${Date.now()}`,
        name: "",
        value: "",
        valueType: "fixed",
      },
    ],
    sendHeaders: false,
    headersMode: "fields",
    headersSpecifierType: "fixed",
    headersJson: "",
    headersJsonType: "fixed",
    headers: [
      {
        id: `hdr-${Date.now()}`,
        name: "",
        value: "",
        valueType: "fixed",
      },
    ],
    sendBody: false,
    bodyMode: "json",
    bodySpecifierType: "fixed",
    bodyJson: "",
    bodyJsonType: "fixed",
    bodyFields: [
      {
        id: `body-${Date.now()}`,
        name: "",
        value: "",
        valueType: "fixed",
      },
    ],
  })
  const [leftPaneWidth, setLeftPaneWidth] = React.useState(0.3)
  const [centerPaneWidth, setCenterPaneWidth] = React.useState(0.4)
  const [isResizing, setIsResizing] = React.useState<"left" | "right" | null>(
    null
  )

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const hasManualTrigger = React.useMemo(
    () => nodes.some((n) => n.type === "manualTrigger"),
    [nodes]
  )
  const hasAnyTrigger = React.useMemo(
    () =>
      nodes.some(
        (n) =>
          n.type === "manualTrigger" ||
          n.type === "webhookTrigger" ||
          n.type === "scheduleTrigger"
      ),
    [nodes]
  )

  const onConnect = React.useCallback(
    (params: Connection) => {
      setEdges((snapshot) =>
        addEdge(
          {
            ...params,
            type: EDGE_TYPE,
            style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
          },
          snapshot
        )
      )
    },
    [setEdges]
  )

  React.useEffect(() => {
    setEdges((current) => {
      let changed = false
      const normalized = current.map((edge) => {
        const needsType = edge.type !== EDGE_TYPE
        const needsStyle =
          edge.style?.stroke !== "#8b8b8b" || edge.style?.strokeWidth !== 1.5
        if (!needsType && !needsStyle) return edge
        changed = true
        return {
          ...edge,
          type: EDGE_TYPE,
          style: {
            ...(edge.style ?? {}),
            stroke: "#8b8b8b",
            strokeWidth: 1.5,
          },
        }
      })
      return changed ? normalized : current
    })
  }, [setEdges])

  React.useEffect(() => {
    onWorkflowChange?.({ nodes, edges })
  }, [nodes, edges, onWorkflowChange])

  const addNodeFromSelector = React.useCallback(
    (selection: (typeof nodeOptions)[number]) => {
      if (selection.type === "manual-trigger" && hasManualTrigger) {
        setSelectorOpen(false)
        setPendingEdgeInsert(null)
        return
      }

      const isExecutionType =
        selection.type === "http-request" ||
        selection.type === "gemini-execution" ||
        selection.type === "chatgpt-execution" ||
        selection.type === "anthropic-execution" ||
        selection.type === "tavily-execution"

      if (isExecutionType && !hasAnyTrigger) {
        setSelectorOpen(false)
        setPendingEdgeInsert(null)
        return
      }

      const newNodeId = `node-${Date.now()}-${nodes.length + 1}`

      setNodes((currentNodes: Node[]) => {
        const existingInitial = currentNodes.find(
          (node) => node.type === "initialPlus"
        )
        const sourceNode = pendingSourceNodeId
          ? currentNodes.find((node) => node.id === pendingSourceNodeId)
          : null
        const insertSourceNode = pendingEdgeInsert
          ? currentNodes.find((node) => node.id === pendingEdgeInsert.source)
          : null
        const insertTargetNode = pendingEdgeInsert
          ? currentNodes.find((node) => node.id === pendingEdgeInsert.target)
          : null
        const nextIndex = currentNodes.length + 1
        const y = 120 + (nextIndex % 5) * 120
        const newNode: Node = {
          id: newNodeId,
          type:
            selection.type === "manual-trigger"
              ? "manualTrigger"
              : selection.type === "webhook-trigger"
                ? "webhookTrigger"
                : selection.type === "schedule-trigger"
                  ? "scheduleTrigger"
                  : selection.type === "gemini-execution"
                    ? "geminiExecution"
                    : selection.type === "chatgpt-execution"
                      ? "chatGptExecution"
                      : selection.type === "anthropic-execution"
                        ? "anthropicExecution"
                        : selection.type === "tavily-execution"
                          ? "tavilyExecution"
                          : "httpRequest",
          position: sourceNode
            ? {
                x: sourceNode.position.x + 220,
                y: sourceNode.position.y,
              }
            : insertSourceNode && insertTargetNode
              ? {
                  x:
                    (insertSourceNode.position.x +
                      insertTargetNode.position.x) /
                    2,
                  y:
                    (insertSourceNode.position.y +
                      insertTargetNode.position.y) /
                    2,
                }
              : existingInitial
                ? existingInitial.position
                : {
                    x: 220 + nextIndex * 40,
                    y,
                  },
          data: { label: selection.label },
        }

        if (existingInitial) {
          return currentNodes
            .filter((node) => node.id !== existingInitial.id)
            .concat(newNode)
        }

        return [...currentNodes, newNode]
      })

      if (pendingSourceNodeId) {
        setEdges((snapshot) =>
          addEdge(
            {
              id: `e-${pendingSourceNodeId}-${newNodeId}`,
              source: pendingSourceNodeId,
              target: newNodeId,
              type: EDGE_TYPE,
              style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
            },
            snapshot
          )
        )
      }
      if (pendingEdgeInsert) {
        setEdges((snapshot) => {
          const withoutOriginal = snapshot.filter(
            (edge) => edge.id !== pendingEdgeInsert.edgeId
          )
          const withSourceToNew = addEdge(
            {
              id: `e-${pendingEdgeInsert.source}-${newNodeId}`,
              source: pendingEdgeInsert.source,
              target: newNodeId,
              type: EDGE_TYPE,
              style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
            },
            withoutOriginal
          )

          return addEdge(
            {
              id: `e-${newNodeId}-${pendingEdgeInsert.target}`,
              source: newNodeId,
              target: pendingEdgeInsert.target,
              type: EDGE_TYPE,
              style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
            },
            withSourceToNew
          )
        })
      }

      setPendingSourceNodeId(null)
      setPendingEdgeInsert(null)
      setSelectorMode("all")
      setSelectorOpen(false)
    },
    [
      hasAnyTrigger,
      nodes,
      pendingEdgeInsert,
      pendingSourceNodeId,
      setEdges,
      setNodes,
      hasManualTrigger,
    ]
  )

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredTriggerNodeOptions = triggerNodeOptions.filter((option) =>
    `${option.label} ${option.description}`
      .toLowerCase()
      .includes(normalizedQuery)
  )
  const filteredExecutionNodeOptions = executionNodeOptions.filter((option) =>
    `${option.label} ${option.description}`
      .toLowerCase()
      .includes(normalizedQuery)
  )
  const parsedOutput = React.useMemo(() => {
    const raw = nodeEditor.outputSample?.trim()
    if (!raw) return null
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }, [nodeEditor.outputSample])
  const prettyJsonOutput = React.useMemo(() => {
    if (parsedOutput !== null) {
      return JSON.stringify(parsedOutput, null, 2)
    }
    return nodeEditor.outputSample || ""
  }, [nodeEditor.outputSample, parsedOutput])
  const hasAnyOutput = React.useMemo(
    () => (nodeEditor.outputSample?.trim()?.length ?? 0) > 0,
    [nodeEditor.outputSample]
  )
  const previousNode = React.useMemo(() => {
    if (!nodeEditor.nodeId) return null
    const incomingEdge = edges.find((edge) => edge.target === nodeEditor.nodeId)
    if (!incomingEdge?.source) return null
    return nodes.find((node) => node.id === incomingEdge.source) ?? null
  }, [edges, nodeEditor.nodeId, nodes])
  const previousNodeData = (previousNode?.data ?? {}) as WorkflowNodeData
  const previousNodeOutput = previousNodeData.outputSample ?? ""
  const parsedPreviousOutput = React.useMemo(() => {
    const raw = previousNodeOutput.trim()
    if (!raw) return null
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }, [previousNodeOutput])
  const prettyPreviousJsonOutput = React.useMemo(() => {
    if (parsedPreviousOutput !== null) {
      return JSON.stringify(parsedPreviousOutput, null, 2)
    }
    return previousNodeOutput
  }, [parsedPreviousOutput, previousNodeOutput])
  const hasPreviousOutput = React.useMemo(
    () => previousNodeOutput.trim().length > 0,
    [previousNodeOutput]
  )
  const expressionFieldPaths = React.useMemo(
    () => getExpressionPaths(parsedPreviousOutput),
    [parsedPreviousOutput]
  )
  const selectedNodeErrorDetails = React.useMemo(
    () => (nodeEditor.nodeId ? nodeErrorDetails[nodeEditor.nodeId] : undefined),
    [nodeEditor.nodeId, nodeErrorDetails]
  )

  const executeWorkflowNow = async (targetNodeId?: string) => {
    const unconfiguredNodes = getUnconfiguredNodes(nodes)
    if (unconfiguredNodes.length > 0) {
      const count = unconfiguredNodes.length
      toast.error(
        count === 1
          ? "1 node is not configured properly."
          : `${count} nodes are not configured properly.`,
        {
          description:
            "Please configure required fields before executing the workflow.",
        }
      )
      return
    }

    setIsExecuting(true)
    const now = new Date().toLocaleTimeString()
    setLastExecutedAt(now)
    setExecutionStatuses([])
    setNodeErrorDetails({})
    const initialStatuses: Record<string, NodeRunStatus> = {}
    for (const node of nodes) {
      initialStatuses[node.id] = "initial"
    }
    const manualNode = nodes.find((n) => n.type === "manualTrigger")
    if (manualNode) {
      initialStatuses[manualNode.id] = "loading"
    }
    setNodeStatuses(initialStatuses)
    try {
      if (onExecuteWorkflow) {
        const toNodeRunStatus = (
          status: "running" | "success" | "error" | "skipped"
        ): NodeRunStatus =>
          status === "success"
            ? "success"
            : status === "error"
              ? "error"
              : status === "running"
                ? "loading"
                : "initial"
        const streamedStatuses: Array<{
          nodeId: string
          label: string
          status: "running" | "success" | "error" | "skipped"
          message?: string
          statusCode?: number
          output?: string
          errorDetails?: {
            source?: string
            code?: number
            fullMessage?: string
            request?: {
              method?: string
              url?: string
              headers?: Record<string, string>
              body?: string | null
            }
          }
        }> = []
        const result = await onExecuteWorkflow(
          (status) => {
            if (status.errorDetails && status.status === "error") {
              setNodeErrorDetails((current) => ({
                ...current,
                [status.nodeId]: status.errorDetails!,
              }))
            }
            streamedStatuses.push(status)
            setExecutionStatuses([...streamedStatuses])

            setNodeStatuses((current) => {
              const next = { ...current }
              next[status.nodeId] = toNodeRunStatus(status.status)
              return next
            })

            if (status.output) {
              setNodes((currentNodes) =>
                currentNodes.map((node) =>
                  node.id === status.nodeId
                    ? {
                        ...node,
                        data: {
                          ...(node.data as WorkflowNodeData),
                          outputSample: status.output ?? "",
                        },
                      }
                    : node
                )
              )
              setNodeEditor((currentEditor) =>
                currentEditor.nodeId === status.nodeId
                  ? {
                      ...currentEditor,
                      outputSample: status.output ?? "",
                    }
                  : currentEditor
              )
            }
          },
          targetNodeId ? { targetNodeId } : undefined
        )
        const finalStatuses = result?.statuses?.length
          ? result.statuses
          : streamedStatuses
        setExecutionStatuses(finalStatuses)
        if (finalStatuses.length) {
          const mapped: Record<string, NodeRunStatus> = { ...initialStatuses }

          for (const item of finalStatuses) {
            mapped[item.nodeId] = toNodeRunStatus(item.status)
            if (item.output) {
              setNodes((currentNodes) =>
                currentNodes.map((node) =>
                  node.id === item.nodeId
                    ? {
                        ...node,
                        data: {
                          ...(node.data as WorkflowNodeData),
                          outputSample: item.output ?? "",
                        },
                      }
                    : node
                )
              )
              setNodeEditor((currentEditor) =>
                currentEditor.nodeId === item.nodeId
                  ? {
                      ...currentEditor,
                      outputSample: item.output ?? "",
                    }
                  : currentEditor
              )
            }
            if (item.errorDetails && item.status === "error") {
              setNodeErrorDetails((current) => ({
                ...current,
                [item.nodeId]: item.errorDetails!,
              }))
            }
          }
          setNodeStatuses(mapped)
        } else {
          setNodeStatuses(() => {
            const fallbackStatuses = { ...initialStatuses }
            return fallbackStatuses
          })
        }
      } else {
        setExecutionStatuses([
          {
            nodeId: "manual",
            label: "Manual Trigger",
            status: "success",
            message: "Executed locally",
          },
        ])
        setNodeStatuses(initialStatuses)
      }
    } finally {
      setIsExecuting(false)
    }
  }

  return {
    colorMode,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectorOpen,
    setSelectorOpen,
    selectorMode,
    setSelectorMode,
    pendingSourceNodeId,
    setPendingSourceNodeId,
    pendingEdgeInsert,
    setPendingEdgeInsert,
    searchQuery,
    setSearchQuery,
    lastExecutedAt,
    isExecuting,
    nodeStatuses,
    setNodeStatuses,
    executionStatuses,
    nodeErrorDetails,
    setNodeErrorDetails,
    connectingFromNodeId,
    setConnectingFromNodeId,
    nodeEditor,
    setNodeEditor,
    leftPaneWidth,
    setLeftPaneWidth,
    centerPaneWidth,
    setCenterPaneWidth,
    isResizing,
    setIsResizing,
    hasManualTrigger,
    hasAnyTrigger,
    onConnect,
    addNodeFromSelector,
    filteredTriggerNodeOptions,
    filteredExecutionNodeOptions,
    parsedOutput,
    prettyJsonOutput,
    hasAnyOutput,
    previousNode,
    previousNodeData,
    previousNodeOutput,
    parsedPreviousOutput,
    prettyPreviousJsonOutput,
    hasPreviousOutput,
    expressionFieldPaths,
    selectedNodeErrorDetails,
    executeWorkflowNow,
  }
}
