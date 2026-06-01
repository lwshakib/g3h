"use client"

import * as React from "react"
import {
  addEdge,
  BaseEdge,
  Background,
  ConnectionLineType,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MiniMap,
  getBezierPath,
  type EdgeProps,
  type NodeProps,
  Panel,
  Position,
  ReactFlow,
  useReactFlow,
  useStore,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useTheme } from "next-themes"
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  GlobeIcon,
  InfoIcon,
  MousePointerIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  PowerIcon,
  Loader2Icon,
  CircleXIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  Trash2Icon,
  WandSparklesIcon,
  WebhookIcon,
  XIcon,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Switch } from "@workspace/ui/components/switch"
import { toast } from "sonner"
import {
  WorkflowNodeData,
  NodeRunStatus,
  WorkflowEditorProps,
  TRIGGER_NODE_BORDER_STYLE,
  EDGE_TYPE,
  defaultInitialNodes,
  defaultInitialEdges,
  nodeOptions,
  triggerNodeOptions,
  executionNodeOptions,
} from "./workflow/types"
import {
  isNodeConfigured,
  getUnconfiguredNodes,
  getExpressionPaths,
  appendExpression,
  getJsonType,
  formatCellValue,
  getOutputItemCount,
  deleteNodeAndConnections,
} from "./workflow/utils"
import {
  GeminiLogoIcon,
  OpenAiLogoIcon,
  AnthropicLogoIcon,
  TavilyLogoIcon,
} from "./workflow/icons"
import {
  InitialPlusNode,
  ManualTriggerNode,
  WebhookTriggerNode,
  ScheduleTriggerNode,
  HttpRequestNode,
  GeminiExecutionNode,
  ChatGptExecutionNode,
  AnthropicExecutionNode,
  TavilyExecutionNode,
} from "./workflow/nodes"
import { ButtonEdge, NodeTopToolbar } from "./workflow/edges"
import {
  NodeConfigIndicator,
  NodeStatusBorder,
  SchemaTreeNode,
  OutputSchemaTab,
  OutputTableTab,
  OutputErrorDetails,
  OutputTabsPanel,
  InputTabsPanel,
} from "./workflow/panels"
import { SelectorContext, EdgeActionsContext } from "./workflow/contexts"

export function WorkflowEditor({
  initialNodes = defaultInitialNodes,
  initialEdges = defaultInitialEdges,
  showChrome = true,
  onWorkflowChange,
  onExecuteWorkflow,
}: WorkflowEditorProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const colorMode = mounted
    ? resolvedTheme === "dark"
      ? "dark"
      : "light"
    : undefined
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
  const nodeTypes = React.useMemo(
    () => ({
      initialPlus: InitialPlusNode,
      manualTrigger: ManualTriggerNode,
      webhookTrigger: WebhookTriggerNode,
      scheduleTrigger: ScheduleTriggerNode,
      httpRequest: HttpRequestNode,
      geminiExecution: GeminiExecutionNode,
      chatGptExecution: ChatGptExecutionNode,
      anthropicExecution: AnthropicExecutionNode,
      tavilyExecution: TavilyExecutionNode,
    }),
    []
  )
  const edgeTypes = React.useMemo(() => ({ [EDGE_TYPE]: ButtonEdge }), [])
  const displayEdges = React.useMemo(
    () =>
      edges.map((edge) => {
        const targetStatus = nodeStatuses[edge.target]
        const statusStroke =
          targetStatus === "success"
            ? "#10b981"
            : targetStatus === "error"
              ? "#ef4444"
              : targetStatus === "loading"
                ? "#2a43e9"
                : "#8b8b8b"

        return {
          ...edge,
          style: {
            ...(edge.style ?? {}),
            stroke: statusStroke,
            strokeWidth: targetStatus && targetStatus !== "initial" ? 2 : 1.5,
          },
        }
      }),
    [edges, nodeStatuses]
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

  return (
    <SelectorContext.Provider
      value={{
        openSelector: (
          sourceNodeId?: string,
          mode: "all" | "executions" = "all"
        ) => {
          setPendingEdgeInsert(null)
          setPendingSourceNodeId(sourceNodeId ?? null)
          setSelectorMode(mode)
          setSelectorOpen(true)
        },
        openNodeEditor: (
          nodeId: string,
          label: string,
          kind: "Trigger" | "Execution"
        ) => {
          const node = nodes.find((item) => item.id === nodeId)
          const data = (node?.data ?? {}) as WorkflowNodeData
          setNodeEditor({
            isOpen: true,
            nodeId,
            kind,
            value: label,
            nodeType: node?.type ?? null,
            method: data.method || "GET",
            url: data.url || "",
            inputSample: data.inputSample || '{\n  "key": "value"\n}',
            outputSample: data.outputSample || "",
            sendQueryParams: Boolean(data.sendQueryParams),
            queryParamsMode:
              data.queryParamsMode === "json" ? "json" : "fields",
            queryParamsSpecifierType:
              data.queryParamsSpecifierType === "expression"
                ? "expression"
                : "fixed",
            queryParamsJson: data.queryParamsJson || "",
            queryParamsJsonType:
              data.queryParamsJsonType === "expression"
                ? "expression"
                : "fixed",
            queryParams:
              data.queryParams && data.queryParams.length > 0
                ? data.queryParams.map((item, index) => ({
                    id: item.id || `qp-${Date.now()}-${index}`,
                    name: item.name || "",
                    value: item.value || "",
                    valueType:
                      item.valueType === "expression" ? "expression" : "fixed",
                  }))
                : [
                    {
                      id: `qp-${Date.now()}`,
                      name: "",
                      value: "",
                      valueType: "fixed",
                    },
                  ],
            sendHeaders: Boolean(data.sendHeaders),
            headersMode: data.headersMode === "json" ? "json" : "fields",
            headersSpecifierType:
              data.headersSpecifierType === "expression"
                ? "expression"
                : "fixed",
            headersJson: data.headersJson || "",
            headersJsonType:
              data.headersJsonType === "expression" ? "expression" : "fixed",
            headers:
              data.headers && data.headers.length > 0
                ? data.headers.map((item, index) => ({
                    id: item.id || `hdr-${Date.now()}-${index}`,
                    name: item.name || "",
                    value: item.value || "",
                    valueType:
                      item.valueType === "expression" ? "expression" : "fixed",
                  }))
                : [
                    {
                      id: `hdr-${Date.now()}`,
                      name: "",
                      value: "",
                      valueType: "fixed",
                    },
                  ],
            sendBody: Boolean(data.sendBody),
            bodyMode: data.bodyMode === "fields" ? "fields" : "json",
            bodySpecifierType:
              data.bodySpecifierType === "expression" ? "expression" : "fixed",
            bodyJson: data.bodyJson || "",
            bodyJsonType:
              data.bodyJsonType === "expression" ? "expression" : "fixed",
            bodyFields:
              data.bodyFields && data.bodyFields.length > 0
                ? data.bodyFields.map((item, index) => ({
                    id: item.id || `body-${Date.now()}-${index}`,
                    name: item.name || "",
                    value: item.value || "",
                    valueType:
                      item.valueType === "expression" ? "expression" : "fixed",
                  }))
                : [
                    {
                      id: `body-${Date.now()}`,
                      name: "",
                      value: "",
                      valueType: "fixed",
                    },
                  ],
          })
        },
        getNodeStatus: (nodeId: string) => nodeStatuses[nodeId] ?? "initial",
        connectingFromNodeId,
      }}
    >
      <EdgeActionsContext.Provider
        value={{
          onEdgeInsert: (edgeId, source, target) => {
            setPendingSourceNodeId(null)
            setPendingEdgeInsert({ edgeId, source, target })
            setSelectorMode("executions")
            setSelectorOpen(true)
          },
          onEdgeDelete: (edgeId) => {
            setEdges((snapshot) =>
              snapshot.filter((edge) => edge.id !== edgeId)
            )
          },
        }}
      >
        <div className="relative h-full w-full overflow-hidden">
          <ReactFlow
            key={colorMode ?? "pending-theme"}
            colorMode={colorMode}
            nodes={nodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineType={ConnectionLineType.Bezier}
            edgeTypes={edgeTypes}
            onConnectStart={(_, params) => {
              if (params?.handleType === "source" && params?.nodeId) {
                setConnectingFromNodeId(params.nodeId)
                return
              }
              setConnectingFromNodeId(null)
            }}
            onConnectEnd={() => setConnectingFromNodeId(null)}
            nodeTypes={nodeTypes}
            panOnDrag={false}
            selectionOnDrag
            proOptions={{ hideAttribution: true }}
            defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
            fitViewOptions={{ maxZoom: 0.75 }}
            fitView
          >
            {showChrome && <MiniMap />}
            <Background />
            {showChrome && <Controls />}
            {showChrome && !nodes.some((n) => n.type === "initialPlus") && (
              <Panel position="top-right">
                <Button
                  size="icon"
                  variant="outline"
                  className="border-border bg-background text-foreground shadow-sm"
                  onClick={() => {
                    if (
                      selectorOpen &&
                      selectorMode === "all" &&
                      !pendingSourceNodeId
                    ) {
                      setSelectorOpen(false)
                      setPendingEdgeInsert(null)
                      return
                    }
                    setPendingSourceNodeId(null)
                    setPendingEdgeInsert(null)
                    setSelectorMode("all")
                    setSelectorOpen(true)
                  }}
                >
                  <PlusIcon />
                </Button>
              </Panel>
            )}
            {showChrome && hasManualTrigger && (
              <Panel position="bottom-center">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    disabled={isExecuting}
                    onClick={() => executeWorkflowNow()}
                  >
                    {isExecuting ? "Running..." : "Execute workflow"}
                  </Button>
                  {lastExecutedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last executed at {lastExecutedAt}
                    </p>
                  )}
                </div>
              </Panel>
            )}
          </ReactFlow>

          {selectorOpen && (
            <>
              <button
                type="button"
                aria-label="Close node selector"
                className="absolute inset-0 z-20 cursor-default bg-transparent"
                onClick={() => {
                  setSelectorOpen(false)
                  setPendingEdgeInsert(null)
                }}
              />
              <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto border-l border-border bg-background text-foreground shadow-2xl">
                <div className="flex items-start justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="font-semibold">
                      {selectorMode === "executions"
                        ? "Add execution step"
                        : "What triggers this workflow?"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectorMode === "executions"
                        ? "Select an execution to continue this workflow."
                        : "A trigger is a step that starts your workflow."}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectorOpen(false)
                      setPendingEdgeInsert(null)
                    }}
                  >
                    <XIcon />
                  </Button>
                </div>

                <div className="space-y-1 p-3">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search nodes..."
                    className="mb-2"
                  />
                  {selectorMode === "all" && (
                    <>
                      <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                        Triggers
                      </p>
                      {filteredTriggerNodeOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.type}
                            onClick={() => addNodeFromSelector(option)}
                            className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                          >
                            <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                      <Separator />
                    </>
                  )}

                  {(selectorMode === "executions" || hasAnyTrigger) && (
                    <p className="px-3 pt-1 pb-1 text-xs font-medium text-muted-foreground">
                      Executions
                    </p>
                  )}
                  {(selectorMode === "executions" || hasAnyTrigger) &&
                    filteredExecutionNodeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.type}
                          onClick={() => addNodeFromSelector(option)}
                          className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                        >
                          <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  <Separator />
                </div>
              </aside>
            </>
          )}

          {nodeEditor.isOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-2">
              <div className="relative h-[95vh] w-[98vw] border border-border bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <div className="flex items-center gap-3">
                    <GlobeIcon className="h-4 w-4 text-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">HTTP Request</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span>Docs</span>
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </button>
                    <Separator orientation="vertical" className="h-5" />
                    <button
                      type="button"
                      onClick={() =>
                        setNodeEditor((current) => ({
                          ...current,
                          isOpen: false,
                        }))
                      }
                      className="inline-flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Close editor"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {nodeEditor.nodeType === "httpRequest" ? (
                  <div
                    className="relative h-[calc(100%-73px)] w-full"
                    onMouseMove={(event) => {
                      if (!isResizing) return
                      const container =
                        event.currentTarget.getBoundingClientRect()
                      const x = event.clientX - container.left
                      if (isResizing === "left") {
                        const nextLeft = Math.min(
                          Math.max(x / container.width, 0.2),
                          0.6
                        )
                        const rightWidth = 1 - leftPaneWidth - centerPaneWidth
                        const maxLeft = 0.8 - rightWidth
                        setLeftPaneWidth(Math.min(nextLeft, maxLeft))
                        return
                      }
                      const leftAndCenter = x / container.width
                      const nextCenter = leftAndCenter - leftPaneWidth
                      const clampedCenter = Math.min(
                        Math.max(nextCenter, 0.2),
                        0.6
                      )
                      const maxCenter = 0.8 - leftPaneWidth
                      setCenterPaneWidth(Math.min(clampedCenter, maxCenter))
                    }}
                    onMouseUp={() => setIsResizing(null)}
                    onMouseLeave={() => setIsResizing(null)}
                  >
                    <div
                      className="grid h-full"
                      style={{
                        gridTemplateColumns: `${leftPaneWidth * 100}% 8px ${centerPaneWidth * 100}% 8px auto`,
                      }}
                    >
                      <div className="min-w-0 overflow-hidden border-r border-border p-4">
                        <p className="mb-3 text-xs font-semibold text-muted-foreground">
                          Input
                        </p>
                        {previousNode ? (
                          <div className="h-[calc(100%-22px)]">
                            <InputTabsPanel
                              parsedInput={parsedPreviousOutput}
                              prettyJsonInput={prettyPreviousJsonOutput}
                              hasInput={hasPreviousOutput}
                              isExecuting={isExecuting}
                              previousNodeType={previousNode.type}
                              expressionFieldPaths={expressionFieldPaths}
                              onExecutePreviousStep={() =>
                                executeWorkflowNow(previousNode.id)
                              }
                            />
                          </div>
                        ) : (
                          <div className="flex h-[calc(100%-22px)] items-center justify-center rounded-md border border-border bg-card p-3 text-center text-xs text-muted-foreground">
                            No previous node connected to provide input.
                          </div>
                        )}
                      </div>

                      <div
                        className="cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40"
                        onMouseDown={() => setIsResizing("left")}
                      />

                      <div className="min-w-0 overflow-y-auto border-r border-border p-4">
                        <p className="mb-3 text-xs font-semibold text-muted-foreground">
                          Configuration
                        </p>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">
                              Method
                            </label>
                            <Select
                              value={nodeEditor.method}
                              onValueChange={(value) => {
                                setNodeEditor((current) => ({
                                  ...current,
                                  method: value,
                                }))
                                if (!nodeEditor.nodeId) return
                                setNodes((currentNodes) =>
                                  currentNodes.map((node) =>
                                    node.id === nodeEditor.nodeId
                                      ? {
                                          ...node,
                                          data: {
                                            ...(node.data as WorkflowNodeData),
                                            method: value,
                                          },
                                        }
                                      : node
                                  )
                                )
                              }}
                            >
                              <SelectTrigger className="h-10 w-full bg-card text-sm">
                                <SelectValue placeholder="Method" />
                              </SelectTrigger>
                              <SelectContent className="z-[120]">
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">
                              URL
                            </label>
                            <Input
                              value={nodeEditor.url}
                              onChange={(event) => {
                                const nextValue = event.target.value
                                setNodeEditor((current) => ({
                                  ...current,
                                  url: nextValue,
                                }))
                                if (!nodeEditor.nodeId) return
                                setNodes((currentNodes) =>
                                  currentNodes.map((node) =>
                                    node.id === nodeEditor.nodeId
                                      ? {
                                          ...node,
                                          data: {
                                            ...(node.data as WorkflowNodeData),
                                            url: nextValue,
                                          },
                                        }
                                      : node
                                  )
                                )
                              }}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault()
                                const path =
                                  event.dataTransfer.getData("text/plain")
                                if (!path) return
                                const nextValue = appendExpression(
                                  nodeEditor.url,
                                  path
                                )
                                setNodeEditor((current) => ({
                                  ...current,
                                  url: nextValue,
                                }))
                                if (!nodeEditor.nodeId) return
                                setNodes((currentNodes) =>
                                  currentNodes.map((node) =>
                                    node.id === nodeEditor.nodeId
                                      ? {
                                          ...node,
                                          data: {
                                            ...(node.data as WorkflowNodeData),
                                            url: nextValue,
                                          },
                                        }
                                      : node
                                  )
                                )
                              }}
                              placeholder="https://api.example.com/resource"
                            />
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={nodeEditor.sendQueryParams}
                                  onCheckedChange={(checked) => {
                                    setNodeEditor((current) => ({
                                      ...current,
                                      sendQueryParams: checked,
                                    }))
                                    if (!nodeEditor.nodeId) return
                                    setNodes((currentNodes) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? {
                                              ...node,
                                              data: {
                                                ...(node.data as WorkflowNodeData),
                                                sendQueryParams: checked,
                                              },
                                            }
                                          : node
                                      )
                                    )
                                  }}
                                />
                                <span className="text-sm font-medium text-foreground">
                                  Send Query Parameters
                                </span>
                              </div>
                            </div>

                            {nodeEditor.sendQueryParams && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-foreground">
                                      Specify Query Parameters
                                    </label>
                                    <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNodeEditor((current) => ({
                                            ...current,
                                            queryParamsSpecifierType: "fixed",
                                          }))
                                          if (!nodeEditor.nodeId) return
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? {
                                                    ...node,
                                                    data: {
                                                      ...(node.data as WorkflowNodeData),
                                                      queryParamsSpecifierType:
                                                        "fixed",
                                                    },
                                                  }
                                                : node
                                            )
                                          )
                                        }}
                                        className={`rounded px-2 py-0.5 ${
                                          nodeEditor.queryParamsSpecifierType ===
                                          "fixed"
                                            ? "bg-background text-foreground"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        Fixed
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNodeEditor((current) => ({
                                            ...current,
                                            queryParamsSpecifierType:
                                              "expression",
                                          }))
                                          if (!nodeEditor.nodeId) return
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? {
                                                    ...node,
                                                    data: {
                                                      ...(node.data as WorkflowNodeData),
                                                      queryParamsSpecifierType:
                                                        "expression",
                                                    },
                                                  }
                                                : node
                                            )
                                          )
                                        }}
                                        className={`rounded px-2 py-0.5 ${
                                          nodeEditor.queryParamsSpecifierType ===
                                          "expression"
                                            ? "bg-background text-foreground"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        Expression
                                      </button>
                                    </div>
                                  </div>
                                  <Select
                                    value={nodeEditor.queryParamsMode}
                                    onValueChange={(
                                      value: "fields" | "json"
                                    ) => {
                                      setNodeEditor((current) => ({
                                        ...current,
                                        queryParamsMode: value,
                                      }))
                                      if (!nodeEditor.nodeId) return
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? {
                                                ...node,
                                                data: {
                                                  ...(node.data as WorkflowNodeData),
                                                  queryParamsMode: value,
                                                },
                                              }
                                            : node
                                        )
                                      )
                                    }}
                                  >
                                    <SelectTrigger className="h-9 w-full bg-background text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[120]">
                                      <SelectItem value="fields">
                                        Using Fields Below
                                      </SelectItem>
                                      <SelectItem value="json">
                                        Using JSON
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {nodeEditor.queryParamsMode === "json" ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="text-xs font-medium text-foreground">
                                        JSON
                                      </label>
                                      <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNodeEditor((current) => ({
                                              ...current,
                                              queryParamsJsonType: "fixed",
                                            }))
                                            if (!nodeEditor.nodeId) return
                                            setNodes((currentNodes) =>
                                              currentNodes.map((node) =>
                                                node.id === nodeEditor.nodeId
                                                  ? {
                                                      ...node,
                                                      data: {
                                                        ...(node.data as WorkflowNodeData),
                                                        queryParamsJsonType:
                                                          "fixed",
                                                      },
                                                    }
                                                  : node
                                              )
                                            )
                                          }}
                                          className={`rounded px-2 py-0.5 ${
                                            nodeEditor.queryParamsJsonType ===
                                            "fixed"
                                              ? "bg-background text-foreground"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          Fixed
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNodeEditor((current) => ({
                                              ...current,
                                              queryParamsJsonType: "expression",
                                            }))
                                            if (!nodeEditor.nodeId) return
                                            setNodes((currentNodes) =>
                                              currentNodes.map((node) =>
                                                node.id === nodeEditor.nodeId
                                                  ? {
                                                      ...node,
                                                      data: {
                                                        ...(node.data as WorkflowNodeData),
                                                        queryParamsJsonType:
                                                          "expression",
                                                      },
                                                    }
                                                  : node
                                              )
                                            )
                                          }}
                                          className={`rounded px-2 py-0.5 ${
                                            nodeEditor.queryParamsJsonType ===
                                            "expression"
                                              ? "bg-background text-foreground"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          Expression
                                        </button>
                                      </div>
                                    </div>
                                    <textarea
                                      value={nodeEditor.queryParamsJson}
                                      onChange={(event) => {
                                        const nextValue = event.target.value
                                        setNodeEditor((current) => ({
                                          ...current,
                                          queryParamsJson: nextValue,
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    queryParamsJson: nextValue,
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                      onDragOver={(event) =>
                                        event.preventDefault()
                                      }
                                      onDrop={(event) => {
                                        event.preventDefault()
                                        const path =
                                          event.dataTransfer.getData(
                                            "text/plain"
                                          )
                                        if (!path) return
                                        const nextValue = appendExpression(
                                          nodeEditor.queryParamsJson,
                                          path
                                        )
                                        setNodeEditor((current) => ({
                                          ...current,
                                          queryParamsJson: nextValue,
                                          queryParamsJsonType: "expression",
                                          queryParamsSpecifierType:
                                            "expression",
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    queryParamsJson: nextValue,
                                                    queryParamsJsonType:
                                                      "expression",
                                                    queryParamsSpecifierType:
                                                      "expression",
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                      placeholder={`{\n  "page": "1",\n  "limit": "10"\n}`}
                                      className="h-24 w-full resize-none rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-medium text-foreground">
                                        Query Parameters
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextParams = [
                                            ...nodeEditor.queryParams,
                                            {
                                              id: `qp-${Date.now()}`,
                                              name: "",
                                              value: "",
                                              valueType: "fixed" as const,
                                            },
                                          ]
                                          setNodeEditor((current) => ({
                                            ...current,
                                            queryParams: nextParams,
                                          }))
                                          if (!nodeEditor.nodeId) return
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? {
                                                    ...node,
                                                    data: {
                                                      ...(node.data as WorkflowNodeData),
                                                      queryParams: nextParams,
                                                    },
                                                  }
                                                : node
                                            )
                                          )
                                        }}
                                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
                                        aria-label="Add query parameter"
                                      >
                                        <PlusIcon className="h-3.5 w-3.5" />
                                      </button>
                                    </div>

                                    <div className="space-y-2">
                                      {nodeEditor.queryParams.map(
                                        (param, index) => (
                                          <Accordion
                                            key={param.id}
                                            type="single"
                                            collapsible
                                            defaultValue={param.id}
                                            className="group/param rounded-md border border-border px-3"
                                          >
                                            <AccordionItem
                                              value={param.id}
                                              className="border-none"
                                            >
                                              <AccordionTrigger className="py-2 text-sm no-underline hover:no-underline [&>svg]:hidden">
                                                <div className="flex w-full items-center justify-between gap-2 pr-1">
                                                  <div className="flex min-w-0 items-center gap-2">
                                                    <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="truncate">
                                                      {param.name?.trim()
                                                        ? param.name
                                                        : `Query Parameter ${index + 1}`}
                                                    </span>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    aria-label="Delete query parameter"
                                                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground opacity-0 transition-opacity group-hover/param:opacity-100 hover:text-foreground"
                                                    onMouseDown={(event) => {
                                                      event.preventDefault()
                                                      event.stopPropagation()
                                                    }}
                                                    onClick={(event) => {
                                                      event.preventDefault()
                                                      event.stopPropagation()
                                                      const nextParams =
                                                        nodeEditor.queryParams.filter(
                                                          (item) =>
                                                            item.id !== param.id
                                                        )
                                                      const normalizedParams =
                                                        nextParams.length > 0
                                                          ? nextParams
                                                          : [
                                                              {
                                                                id: `qp-${Date.now()}`,
                                                                name: "",
                                                                value: "",
                                                                valueType:
                                                                  "fixed" as const,
                                                              },
                                                            ]
                                                      setNodeEditor(
                                                        (current) => ({
                                                          ...current,
                                                          queryParams:
                                                            normalizedParams,
                                                        })
                                                      )
                                                      if (!nodeEditor.nodeId)
                                                        return
                                                      setNodes((currentNodes) =>
                                                        currentNodes.map(
                                                          (node) =>
                                                            node.id ===
                                                            nodeEditor.nodeId
                                                              ? {
                                                                  ...node,
                                                                  data: {
                                                                    ...(node.data as WorkflowNodeData),
                                                                    queryParams:
                                                                      normalizedParams,
                                                                  },
                                                                }
                                                              : node
                                                        )
                                                      )
                                                    }}
                                                  >
                                                    <Trash2Icon className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>
                                              </AccordionTrigger>
                                              <AccordionContent>
                                                <div className="space-y-3">
                                                  <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">
                                                      Name
                                                    </label>
                                                    <Input
                                                      value={param.name}
                                                      onChange={(event) => {
                                                        const nextParams =
                                                          nodeEditor.queryParams.map(
                                                            (item) =>
                                                              item.id ===
                                                              param.id
                                                                ? {
                                                                    ...item,
                                                                    name: event
                                                                      .target
                                                                      .value,
                                                                  }
                                                                : item
                                                          )
                                                        setNodeEditor(
                                                          (current) => ({
                                                            ...current,
                                                            queryParams:
                                                              nextParams,
                                                            queryParamsSpecifierType:
                                                              "expression",
                                                          })
                                                        )
                                                        if (!nodeEditor.nodeId)
                                                          return
                                                        setNodes(
                                                          (currentNodes) =>
                                                            currentNodes.map(
                                                              (node) =>
                                                                node.id ===
                                                                nodeEditor.nodeId
                                                                  ? {
                                                                      ...node,
                                                                      data: {
                                                                        ...(node.data as WorkflowNodeData),
                                                                        queryParams:
                                                                          nextParams,
                                                                        queryParamsSpecifierType:
                                                                          "expression",
                                                                      },
                                                                    }
                                                                  : node
                                                            )
                                                        )
                                                      }}
                                                      onDragOver={(event) =>
                                                        event.preventDefault()
                                                      }
                                                      onDrop={(event) => {
                                                        event.preventDefault()
                                                        const path =
                                                          event.dataTransfer.getData(
                                                            "text/plain"
                                                          )
                                                        if (!path) return
                                                        const nextParams =
                                                          nodeEditor.queryParams.map(
                                                            (item) =>
                                                              item.id ===
                                                              param.id
                                                                ? {
                                                                    ...item,
                                                                    name: appendExpression(
                                                                      item.name,
                                                                      path
                                                                    ),
                                                                    valueType:
                                                                      "expression" as const,
                                                                  }
                                                                : item
                                                          )
                                                        setNodeEditor(
                                                          (current) => ({
                                                            ...current,
                                                            queryParams:
                                                              nextParams,
                                                            queryParamsSpecifierType:
                                                              "expression",
                                                          })
                                                        )
                                                        setNodeEditor(
                                                          (current) => ({
                                                            ...current,
                                                            queryParamsSpecifierType:
                                                              "expression",
                                                          })
                                                        )
                                                        if (!nodeEditor.nodeId)
                                                          return
                                                        setNodes(
                                                          (currentNodes) =>
                                                            currentNodes.map(
                                                              (node) =>
                                                                node.id ===
                                                                nodeEditor.nodeId
                                                                  ? {
                                                                      ...node,
                                                                      data: {
                                                                        ...(node.data as WorkflowNodeData),
                                                                        queryParams:
                                                                          nextParams,
                                                                        queryParamsSpecifierType:
                                                                          "expression",
                                                                      },
                                                                    }
                                                                  : node
                                                            )
                                                        )
                                                      }}
                                                      className="h-8 text-xs"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                      <label className="text-xs font-medium text-foreground">
                                                        Value
                                                      </label>
                                                      <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            const nextParams =
                                                              nodeEditor.queryParams.map(
                                                                (item) =>
                                                                  item.id ===
                                                                  param.id
                                                                    ? {
                                                                        ...item,
                                                                        valueType:
                                                                          "fixed" as const,
                                                                      }
                                                                    : item
                                                              )
                                                            setNodeEditor(
                                                              (current) => ({
                                                                ...current,
                                                                queryParams:
                                                                  nextParams,
                                                              })
                                                            )
                                                            if (
                                                              !nodeEditor.nodeId
                                                            )
                                                              return
                                                            setNodes(
                                                              (currentNodes) =>
                                                                currentNodes.map(
                                                                  (node) =>
                                                                    node.id ===
                                                                    nodeEditor.nodeId
                                                                      ? {
                                                                          ...node,
                                                                          data: {
                                                                            ...(node.data as WorkflowNodeData),
                                                                            queryParams:
                                                                              nextParams,
                                                                          },
                                                                        }
                                                                      : node
                                                                )
                                                            )
                                                          }}
                                                          className={`rounded px-2 py-0.5 ${
                                                            (param.valueType ??
                                                              "fixed") ===
                                                            "fixed"
                                                              ? "bg-background text-foreground"
                                                              : "text-muted-foreground"
                                                          }`}
                                                        >
                                                          Fixed
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            const nextParams =
                                                              nodeEditor.queryParams.map(
                                                                (item) =>
                                                                  item.id ===
                                                                  param.id
                                                                    ? {
                                                                        ...item,
                                                                        valueType:
                                                                          "expression" as const,
                                                                      }
                                                                    : item
                                                              )
                                                            setNodeEditor(
                                                              (current) => ({
                                                                ...current,
                                                                queryParams:
                                                                  nextParams,
                                                              })
                                                            )
                                                            if (
                                                              !nodeEditor.nodeId
                                                            )
                                                              return
                                                            setNodes(
                                                              (currentNodes) =>
                                                                currentNodes.map(
                                                                  (node) =>
                                                                    node.id ===
                                                                    nodeEditor.nodeId
                                                                      ? {
                                                                          ...node,
                                                                          data: {
                                                                            ...(node.data as WorkflowNodeData),
                                                                            queryParams:
                                                                              nextParams,
                                                                          },
                                                                        }
                                                                      : node
                                                                )
                                                            )
                                                          }}
                                                          className={`rounded px-2 py-0.5 ${
                                                            (param.valueType ??
                                                              "fixed") ===
                                                            "expression"
                                                              ? "bg-background text-foreground"
                                                              : "text-muted-foreground"
                                                          }`}
                                                        >
                                                          Expression
                                                        </button>
                                                      </div>
                                                    </div>
                                                    <Input
                                                      value={param.value}
                                                      onChange={(event) => {
                                                        const nextParams =
                                                          nodeEditor.queryParams.map(
                                                            (item) =>
                                                              item.id ===
                                                              param.id
                                                                ? {
                                                                    ...item,
                                                                    value:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  }
                                                                : item
                                                          )
                                                        setNodeEditor(
                                                          (current) => ({
                                                            ...current,
                                                            queryParams:
                                                              nextParams,
                                                          })
                                                        )
                                                        if (!nodeEditor.nodeId)
                                                          return
                                                        setNodes(
                                                          (currentNodes) =>
                                                            currentNodes.map(
                                                              (node) =>
                                                                node.id ===
                                                                nodeEditor.nodeId
                                                                  ? {
                                                                      ...node,
                                                                      data: {
                                                                        ...(node.data as WorkflowNodeData),
                                                                        queryParams:
                                                                          nextParams,
                                                                        queryParamsSpecifierType:
                                                                          "expression",
                                                                      },
                                                                    }
                                                                  : node
                                                            )
                                                        )
                                                      }}
                                                      onDragOver={(event) =>
                                                        event.preventDefault()
                                                      }
                                                      onDrop={(event) => {
                                                        event.preventDefault()
                                                        const path =
                                                          event.dataTransfer.getData(
                                                            "text/plain"
                                                          )
                                                        if (!path) return
                                                        const nextParams =
                                                          nodeEditor.queryParams.map(
                                                            (item) =>
                                                              item.id ===
                                                              param.id
                                                                ? {
                                                                    ...item,
                                                                    value:
                                                                      appendExpression(
                                                                        item.value,
                                                                        path
                                                                      ),
                                                                    valueType:
                                                                      "expression" as const,
                                                                  }
                                                                : item
                                                          )
                                                        setNodeEditor(
                                                          (current) => ({
                                                            ...current,
                                                            queryParams:
                                                              nextParams,
                                                          })
                                                        )
                                                        if (!nodeEditor.nodeId)
                                                          return
                                                        setNodes(
                                                          (currentNodes) =>
                                                            currentNodes.map(
                                                              (node) =>
                                                                node.id ===
                                                                nodeEditor.nodeId
                                                                  ? {
                                                                      ...node,
                                                                      data: {
                                                                        ...(node.data as WorkflowNodeData),
                                                                        queryParams:
                                                                          nextParams,
                                                                      },
                                                                    }
                                                                  : node
                                                            )
                                                        )
                                                      }}
                                                      className="h-8 text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </AccordionContent>
                                            </AccordionItem>
                                          </Accordion>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <div className="mb-3 flex items-center gap-2">
                              <Switch
                                checked={nodeEditor.sendHeaders}
                                onCheckedChange={(checked) => {
                                  setNodeEditor((current) => ({
                                    ...current,
                                    sendHeaders: checked,
                                  }))
                                  if (!nodeEditor.nodeId) return
                                  setNodes((currentNodes) =>
                                    currentNodes.map((node) =>
                                      node.id === nodeEditor.nodeId
                                        ? {
                                            ...node,
                                            data: {
                                              ...(node.data as WorkflowNodeData),
                                              sendHeaders: checked,
                                            },
                                          }
                                        : node
                                    )
                                  )
                                }}
                              />
                              <span className="text-sm font-medium text-foreground">
                                Send Headers
                              </span>
                            </div>
                            {nodeEditor.sendHeaders && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-end">
                                  <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNodeEditor((current) => ({
                                          ...current,
                                          headersSpecifierType: "fixed",
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    headersSpecifierType:
                                                      "fixed",
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                      className={`rounded px-2 py-0.5 ${nodeEditor.headersSpecifierType === "fixed" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                                    >
                                      Fixed
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNodeEditor((current) => ({
                                          ...current,
                                          headersSpecifierType: "expression",
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    headersSpecifierType:
                                                      "expression",
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                      className={`rounded px-2 py-0.5 ${nodeEditor.headersSpecifierType === "expression" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                                    >
                                      Expression
                                    </button>
                                  </div>
                                </div>
                                <Select
                                  value={nodeEditor.headersMode}
                                  onValueChange={(value: "fields" | "json") => {
                                    setNodeEditor((current) => ({
                                      ...current,
                                      headersMode: value,
                                    }))
                                    if (!nodeEditor.nodeId) return
                                    setNodes((currentNodes) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? {
                                              ...node,
                                              data: {
                                                ...(node.data as WorkflowNodeData),
                                                headersMode: value,
                                              },
                                            }
                                          : node
                                      )
                                    )
                                  }}
                                >
                                  <SelectTrigger className="h-9 w-full bg-background text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[120]">
                                    <SelectItem value="fields">
                                      Using Fields Below
                                    </SelectItem>
                                    <SelectItem value="json">
                                      Using JSON
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {nodeEditor.headersMode === "json" ? (
                                  <textarea
                                    value={nodeEditor.headersJson}
                                    onChange={(event) => {
                                      const nextValue = event.target.value
                                      setNodeEditor((current) => ({
                                        ...current,
                                        headersJson: nextValue,
                                      }))
                                      if (!nodeEditor.nodeId) return
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? {
                                                ...node,
                                                data: {
                                                  ...(node.data as WorkflowNodeData),
                                                  headersJson: nextValue,
                                                },
                                              }
                                            : node
                                        )
                                      )
                                    }}
                                    onDragOver={(event) =>
                                      event.preventDefault()
                                    }
                                    onDrop={(event) => {
                                      event.preventDefault()
                                      const path =
                                        event.dataTransfer.getData("text/plain")
                                      if (!path) return
                                      const nextValue = appendExpression(
                                        nodeEditor.headersJson,
                                        path
                                      )
                                      setNodeEditor((current) => ({
                                        ...current,
                                        headersJson: nextValue,
                                        headersJsonType: "expression",
                                        headersSpecifierType: "expression",
                                      }))
                                      if (!nodeEditor.nodeId) return
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? {
                                                ...node,
                                                data: {
                                                  ...(node.data as WorkflowNodeData),
                                                  headersJson: nextValue,
                                                  headersJsonType: "expression",
                                                  headersSpecifierType:
                                                    "expression",
                                                },
                                              }
                                            : node
                                        )
                                      )
                                    }}
                                    className="h-24 w-full resize-none rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground"
                                  />
                                ) : (
                                  <div className="space-y-2">
                                    {nodeEditor.headers.map((header, index) => (
                                      <div
                                        key={header.id}
                                        className="rounded-md border border-border p-2"
                                      >
                                        <p className="mb-1 text-xs text-muted-foreground">
                                          {header.name || `Header ${index + 1}`}
                                        </p>
                                        <Input
                                          value={header.name}
                                          onChange={(event) => {
                                            const nextHeaders =
                                              nodeEditor.headers.map((item) =>
                                                item.id === header.id
                                                  ? {
                                                      ...item,
                                                      name: event.target.value,
                                                    }
                                                  : item
                                              )
                                            setNodeEditor((current) => ({
                                              ...current,
                                              headers: nextHeaders,
                                            }))
                                            setNodeEditor((current) => ({
                                              ...current,
                                              headersSpecifierType:
                                                "expression",
                                            }))
                                            if (!nodeEditor.nodeId) return
                                            setNodes((currentNodes) =>
                                              currentNodes.map((node) =>
                                                node.id === nodeEditor.nodeId
                                                  ? {
                                                      ...node,
                                                      data: {
                                                        ...(node.data as WorkflowNodeData),
                                                        headers: nextHeaders,
                                                        headersSpecifierType:
                                                          "expression",
                                                      },
                                                    }
                                                  : node
                                              )
                                            )
                                          }}
                                          onDragOver={(event) =>
                                            event.preventDefault()
                                          }
                                          onDrop={(event) => {
                                            event.preventDefault()
                                            const path =
                                              event.dataTransfer.getData(
                                                "text/plain"
                                              )
                                            if (!path) return
                                            const nextHeaders =
                                              nodeEditor.headers.map((item) =>
                                                item.id === header.id
                                                  ? {
                                                      ...item,
                                                      name: appendExpression(
                                                        item.name,
                                                        path
                                                      ),
                                                      valueType:
                                                        "expression" as const,
                                                    }
                                                  : item
                                              )
                                            setNodeEditor((current) => ({
                                              ...current,
                                              headers: nextHeaders,
                                            }))
                                            setNodeEditor((current) => ({
                                              ...current,
                                              headersSpecifierType:
                                                "expression",
                                            }))
                                            if (!nodeEditor.nodeId) return
                                            setNodes((currentNodes) =>
                                              currentNodes.map((node) =>
                                                node.id === nodeEditor.nodeId
                                                  ? {
                                                      ...node,
                                                      data: {
                                                        ...(node.data as WorkflowNodeData),
                                                        headers: nextHeaders,
                                                        headersSpecifierType:
                                                          "expression",
                                                      },
                                                    }
                                                  : node
                                              )
                                            )
                                          }}
                                          placeholder="Name"
                                          className="mb-1 h-8 text-xs"
                                        />
                                        <Input
                                          value={header.value}
                                          onChange={(event) => {
                                            const nextHeaders =
                                              nodeEditor.headers.map((item) =>
                                                item.id === header.id
                                                  ? {
                                                      ...item,
                                                      value: event.target.value,
                                                    }
                                                  : item
                                              )
                                            setNodeEditor((current) => ({
                                              ...current,
                                              headers: nextHeaders,
                                            }))
                                            if (!nodeEditor.nodeId) return
                                            setNodes((currentNodes) =>
                                              currentNodes.map((node) =>
                                                node.id === nodeEditor.nodeId
                                                  ? {
                                                      ...node,
                                                      data: {
                                                        ...(node.data as WorkflowNodeData),
                                                        headers: nextHeaders,
                                                      },
                                                    }
                                                  : node
                                              )
                                            )
                                          }}
                                          onDragOver={(event) =>
                                            event.preventDefault()
                                          }
                                          onDrop={(event) => {
                                            event.preventDefault()
                                            const path =
                                              event.dataTransfer.getData(
                                                "text/plain"
                                              )
                                            if (!path) return
                                            const nextHeaders =
                                              nodeEditor.headers.map((item) =>
                                                item.id === header.id
                                                  ? {
                                                      ...item,
                                                      value: appendExpression(
                                                        item.value,
                                                        path
                                                      ),
                                                      valueType:
                                                        "expression" as const,
                                                    }
                                                  : item
                                              )
                                            setNodeEditor((current) => ({
                                              ...current,
                                              headers: nextHeaders,
                                            }))
                                            if (!nodeEditor.nodeId) return
                                            setNodes((currentNodes) =>
                                              currentNodes.map((node) =>
                                                node.id === nodeEditor.nodeId
                                                  ? {
                                                      ...node,
                                                      data: {
                                                        ...(node.data as WorkflowNodeData),
                                                        headers: nextHeaders,
                                                      },
                                                    }
                                                  : node
                                              )
                                            )
                                          }}
                                          placeholder="Value"
                                          className="h-8 text-xs"
                                        />
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const nextHeaders = [
                                          ...nodeEditor.headers,
                                          {
                                            id: `hdr-${Date.now()}`,
                                            name: "",
                                            value: "",
                                            valueType: "fixed" as const,
                                          },
                                        ]
                                        setNodeEditor((current) => ({
                                          ...current,
                                          headers: nextHeaders,
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    headers: nextHeaders,
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                    >
                                      Add Header
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <div className="mb-3 flex items-center gap-2">
                              <Switch
                                checked={nodeEditor.sendBody}
                                onCheckedChange={(checked) => {
                                  setNodeEditor((current) => ({
                                    ...current,
                                    sendBody: checked,
                                  }))
                                  if (!nodeEditor.nodeId) return
                                  setNodes((currentNodes) =>
                                    currentNodes.map((node) =>
                                      node.id === nodeEditor.nodeId
                                        ? {
                                            ...node,
                                            data: {
                                              ...(node.data as WorkflowNodeData),
                                              sendBody: checked,
                                            },
                                          }
                                        : node
                                    )
                                  )
                                }}
                              />
                              <span className="text-sm font-medium text-foreground">
                                Send Body
                              </span>
                            </div>
                            {nodeEditor.sendBody && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-end">
                                  <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNodeEditor((current) => ({
                                          ...current,
                                          bodySpecifierType: "fixed",
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    bodySpecifierType: "fixed",
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                      className={`rounded px-2 py-0.5 ${nodeEditor.bodySpecifierType === "fixed" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                                    >
                                      Fixed
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNodeEditor((current) => ({
                                          ...current,
                                          bodySpecifierType: "expression",
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    bodySpecifierType:
                                                      "expression",
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                      className={`rounded px-2 py-0.5 ${nodeEditor.bodySpecifierType === "expression" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                                    >
                                      Expression
                                    </button>
                                  </div>
                                </div>
                                <Select
                                  value={nodeEditor.bodyMode}
                                  onValueChange={(value: "fields" | "json") => {
                                    setNodeEditor((current) => ({
                                      ...current,
                                      bodyMode: value,
                                    }))
                                    if (!nodeEditor.nodeId) return
                                    setNodes((currentNodes) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? {
                                              ...node,
                                              data: {
                                                ...(node.data as WorkflowNodeData),
                                                bodyMode: value,
                                              },
                                            }
                                          : node
                                      )
                                    )
                                  }}
                                >
                                  <SelectTrigger className="h-9 w-full bg-background text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[120]">
                                    <SelectItem value="fields">
                                      Using Fields Below
                                    </SelectItem>
                                    <SelectItem value="json">
                                      Using JSON
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {nodeEditor.bodyMode === "json" ? (
                                  <textarea
                                    value={nodeEditor.bodyJson}
                                    onChange={(event) => {
                                      const nextValue = event.target.value
                                      setNodeEditor((current) => ({
                                        ...current,
                                        bodyJson: nextValue,
                                      }))
                                      if (!nodeEditor.nodeId) return
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? {
                                                ...node,
                                                data: {
                                                  ...(node.data as WorkflowNodeData),
                                                  bodyJson: nextValue,
                                                },
                                              }
                                            : node
                                        )
                                      )
                                    }}
                                    onDragOver={(event) =>
                                      event.preventDefault()
                                    }
                                    onDrop={(event) => {
                                      event.preventDefault()
                                      const path =
                                        event.dataTransfer.getData("text/plain")
                                      if (!path) return
                                      const nextValue = appendExpression(
                                        nodeEditor.bodyJson,
                                        path
                                      )
                                      setNodeEditor((current) => ({
                                        ...current,
                                        bodyJson: nextValue,
                                        bodyJsonType: "expression",
                                        bodySpecifierType: "expression",
                                      }))
                                      if (!nodeEditor.nodeId) return
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? {
                                                ...node,
                                                data: {
                                                  ...(node.data as WorkflowNodeData),
                                                  bodyJson: nextValue,
                                                  bodyJsonType: "expression",
                                                  bodySpecifierType:
                                                    "expression",
                                                },
                                              }
                                            : node
                                        )
                                      )
                                    }}
                                    className="h-24 w-full resize-none rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground"
                                  />
                                ) : (
                                  <div className="space-y-2">
                                    {nodeEditor.bodyFields.map(
                                      (field, index) => (
                                        <div
                                          key={field.id}
                                          className="rounded-md border border-border p-2"
                                        >
                                          <p className="mb-1 text-xs text-muted-foreground">
                                            {field.name ||
                                              `Body Field ${index + 1}`}
                                          </p>
                                          <Input
                                            value={field.name}
                                            onChange={(event) => {
                                              const nextFields =
                                                nodeEditor.bodyFields.map(
                                                  (item) =>
                                                    item.id === field.id
                                                      ? {
                                                          ...item,
                                                          name: event.target
                                                            .value,
                                                        }
                                                      : item
                                                )
                                              setNodeEditor((current) => ({
                                                ...current,
                                                bodyFields: nextFields,
                                              }))
                                              setNodeEditor((current) => ({
                                                ...current,
                                                bodySpecifierType: "expression",
                                              }))
                                              if (!nodeEditor.nodeId) return
                                              setNodes((currentNodes) =>
                                                currentNodes.map((node) =>
                                                  node.id === nodeEditor.nodeId
                                                    ? {
                                                        ...node,
                                                        data: {
                                                          ...(node.data as WorkflowNodeData),
                                                          bodyFields:
                                                            nextFields,
                                                          bodySpecifierType:
                                                            "expression",
                                                        },
                                                      }
                                                    : node
                                                )
                                              )
                                            }}
                                            onDragOver={(event) =>
                                              event.preventDefault()
                                            }
                                            onDrop={(event) => {
                                              event.preventDefault()
                                              const path =
                                                event.dataTransfer.getData(
                                                  "text/plain"
                                                )
                                              if (!path) return
                                              const nextFields =
                                                nodeEditor.bodyFields.map(
                                                  (item) =>
                                                    item.id === field.id
                                                      ? {
                                                          ...item,
                                                          name: appendExpression(
                                                            item.name,
                                                            path
                                                          ),
                                                          valueType:
                                                            "expression" as const,
                                                        }
                                                      : item
                                                )
                                              setNodeEditor((current) => ({
                                                ...current,
                                                bodyFields: nextFields,
                                              }))
                                              setNodeEditor((current) => ({
                                                ...current,
                                                bodySpecifierType: "expression",
                                              }))
                                              if (!nodeEditor.nodeId) return
                                              setNodes((currentNodes) =>
                                                currentNodes.map((node) =>
                                                  node.id === nodeEditor.nodeId
                                                    ? {
                                                        ...node,
                                                        data: {
                                                          ...(node.data as WorkflowNodeData),
                                                          bodyFields:
                                                            nextFields,
                                                          bodySpecifierType:
                                                            "expression",
                                                        },
                                                      }
                                                    : node
                                                )
                                              )
                                            }}
                                            placeholder="Name"
                                            className="mb-1 h-8 text-xs"
                                          />
                                          <Input
                                            value={field.value}
                                            onChange={(event) => {
                                              const nextFields =
                                                nodeEditor.bodyFields.map(
                                                  (item) =>
                                                    item.id === field.id
                                                      ? {
                                                          ...item,
                                                          value:
                                                            event.target.value,
                                                        }
                                                      : item
                                                )
                                              setNodeEditor((current) => ({
                                                ...current,
                                                bodyFields: nextFields,
                                              }))
                                              if (!nodeEditor.nodeId) return
                                              setNodes((currentNodes) =>
                                                currentNodes.map((node) =>
                                                  node.id === nodeEditor.nodeId
                                                    ? {
                                                        ...node,
                                                        data: {
                                                          ...(node.data as WorkflowNodeData),
                                                          bodyFields:
                                                            nextFields,
                                                        },
                                                      }
                                                    : node
                                                )
                                              )
                                            }}
                                            onDragOver={(event) =>
                                              event.preventDefault()
                                            }
                                            onDrop={(event) => {
                                              event.preventDefault()
                                              const path =
                                                event.dataTransfer.getData(
                                                  "text/plain"
                                                )
                                              if (!path) return
                                              const nextFields =
                                                nodeEditor.bodyFields.map(
                                                  (item) =>
                                                    item.id === field.id
                                                      ? {
                                                          ...item,
                                                          value:
                                                            appendExpression(
                                                              item.value,
                                                              path
                                                            ),
                                                          valueType:
                                                            "expression" as const,
                                                        }
                                                      : item
                                                )
                                              setNodeEditor((current) => ({
                                                ...current,
                                                bodyFields: nextFields,
                                              }))
                                              if (!nodeEditor.nodeId) return
                                              setNodes((currentNodes) =>
                                                currentNodes.map((node) =>
                                                  node.id === nodeEditor.nodeId
                                                    ? {
                                                        ...node,
                                                        data: {
                                                          ...(node.data as WorkflowNodeData),
                                                          bodyFields:
                                                            nextFields,
                                                        },
                                                      }
                                                    : node
                                                )
                                              )
                                            }}
                                            placeholder="Value"
                                            className="h-8 text-xs"
                                          />
                                        </div>
                                      )
                                    )}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const nextFields = [
                                          ...nodeEditor.bodyFields,
                                          {
                                            id: `body-${Date.now()}`,
                                            name: "",
                                            value: "",
                                            valueType: "fixed" as const,
                                          },
                                        ]
                                        setNodeEditor((current) => ({
                                          ...current,
                                          bodyFields: nextFields,
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes) =>
                                          currentNodes.map((node) =>
                                            node.id === nodeEditor.nodeId
                                              ? {
                                                  ...node,
                                                  data: {
                                                    ...(node.data as WorkflowNodeData),
                                                    bodyFields: nextFields,
                                                  },
                                                }
                                              : node
                                          )
                                        )
                                      }}
                                    >
                                      Add Body Field
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40"
                        onMouseDown={() => setIsResizing("right")}
                      />

                      <div className="min-w-0 overflow-hidden p-4">
                        <div className="h-[calc(100%-22px)]">
                          <OutputTabsPanel
                            parsedOutput={parsedOutput}
                            prettyJsonOutput={prettyJsonOutput}
                            hasOutput={hasAnyOutput}
                            isExecuting={isExecuting}
                            errorDetails={selectedNodeErrorDetails}
                            onExecuteStep={() =>
                              executeWorkflowNow(nodeEditor.nodeId ?? undefined)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Node title
                      </label>
                      <Input
                        value={nodeEditor.value}
                        onChange={(event) => {
                          const nextValue = event.target.value
                          setNodeEditor((current) => ({
                            ...current,
                            value: nextValue,
                          }))
                          if (!nodeEditor.nodeId) return
                          setNodes((currentNodes) =>
                            currentNodes.map((node) =>
                              node.id === nodeEditor.nodeId
                                ? {
                                    ...node,
                                    data: {
                                      ...(node.data as WorkflowNodeData),
                                      label:
                                        nextValue.trim() || "Untitled Node",
                                    },
                                  }
                                : node
                            )
                          )
                        }}
                        placeholder="Enter node title..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </EdgeActionsContext.Provider>
    </SelectorContext.Provider>
  )
}
