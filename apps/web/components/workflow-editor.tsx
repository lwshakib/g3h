"use client"

import * as React from "react"
import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ExternalLinkIcon, GlobeIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"

import {
  WorkflowNodeData,
  WorkflowEditorProps,
  EDGE_TYPE,
} from "./workflow/types"
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
import { ButtonEdge } from "./workflow/edges"
import { InputTabsPanel, OutputTabsPanel } from "./workflow/panels"
import { SelectorContext, EdgeActionsContext } from "./workflow/contexts"

import { useWorkflowEditor } from "./workflow/use-workflow-editor"
import { NodeSelectorDrawer } from "./workflow/node-selector-drawer"
import { HttpRequestConfigPanel } from "./workflow/panels/http-request-config-panel"

export function WorkflowEditor({
  initialNodes,
  initialEdges,
  showChrome = true,
  onWorkflowChange,
  onExecuteWorkflow,
}: WorkflowEditorProps) {
  const {
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
    parsedPreviousOutput,
    prettyPreviousJsonOutput,
    hasPreviousOutput,
    expressionFieldPaths,
    selectedNodeErrorDetails,
    executeWorkflowNow,
  } = useWorkflowEditor({
    initialNodes,
    initialEdges,
    onWorkflowChange,
    onExecuteWorkflow,
  })

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

          <NodeSelectorDrawer
            selectorOpen={selectorOpen}
            selectorMode={selectorMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            hasAnyTrigger={hasAnyTrigger}
            filteredTriggerNodeOptions={filteredTriggerNodeOptions}
            filteredExecutionNodeOptions={filteredExecutionNodeOptions}
            onClose={() => {
              setSelectorOpen(false)
              setPendingEdgeInsert(null)
            }}
            onSelectOption={addNodeFromSelector}
          />

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

                      <HttpRequestConfigPanel
                        nodeEditor={nodeEditor}
                        setNodeEditor={setNodeEditor}
                        setNodes={setNodes}
                      />

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
