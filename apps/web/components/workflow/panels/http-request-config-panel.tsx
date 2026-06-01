"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon, ChevronRightIcon } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { type WorkflowNodeData } from "../types"
import { appendExpression } from "../utils"

interface HttpRequestConfigPanelProps {
  nodeEditor: {
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
  }
  setNodeEditor: React.Dispatch<
    React.SetStateAction<HttpRequestConfigPanelProps["nodeEditor"]>
  >
  setNodes: React.Dispatch<React.SetStateAction<any>>
}

export function HttpRequestConfigPanel({
  nodeEditor,
  setNodeEditor,
  setNodes,
}: HttpRequestConfigPanelProps) {
  return (
    <div className="min-w-0 overflow-y-auto border-r border-border p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">
        Configuration
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Method</label>
          <Select
            value={nodeEditor.method}
            onValueChange={(value) => {
              setNodeEditor((current) => ({
                ...current,
                method: value,
              }))
              if (!nodeEditor.nodeId) return
              setNodes((currentNodes: any[]) =>
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
          <label className="text-xs font-medium text-foreground">URL</label>
          <Input
            value={nodeEditor.url}
            onChange={(event) => {
              const nextValue = event.target.value
              setNodeEditor((current) => ({
                ...current,
                url: nextValue,
              }))
              if (!nodeEditor.nodeId) return
              setNodes((currentNodes: any[]) =>
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
              const path = event.dataTransfer.getData("text/plain")
              if (!path) return
              const nextValue = appendExpression(nodeEditor.url, path)
              setNodeEditor((current) => ({
                ...current,
                url: nextValue,
              }))
              if (!nodeEditor.nodeId) return
              setNodes((currentNodes: any[]) =>
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
                  setNodes((currentNodes: any[]) =>
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
                        setNodes((currentNodes: any[]) =>
                          currentNodes.map((node) =>
                            node.id === nodeEditor.nodeId
                              ? {
                                  ...node,
                                  data: {
                                    ...(node.data as WorkflowNodeData),
                                    queryParamsSpecifierType: "fixed",
                                  },
                                }
                              : node
                          )
                        )
                      }}
                      className={`rounded px-2 py-0.5 ${
                        nodeEditor.queryParamsSpecifierType === "fixed"
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
                          queryParamsSpecifierType: "expression",
                        }))
                        if (!nodeEditor.nodeId) return
                        setNodes((currentNodes: any[]) =>
                          currentNodes.map((node) =>
                            node.id === nodeEditor.nodeId
                              ? {
                                  ...node,
                                  data: {
                                    ...(node.data as WorkflowNodeData),
                                    queryParamsSpecifierType: "expression",
                                  },
                                }
                              : node
                          )
                        )
                      }}
                      className={`rounded px-2 py-0.5 ${
                        nodeEditor.queryParamsSpecifierType === "expression"
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
                  onValueChange={(value: "fields" | "json") => {
                    setNodeEditor((current) => ({
                      ...current,
                      queryParamsMode: value,
                    }))
                    if (!nodeEditor.nodeId) return
                    setNodes((currentNodes: any[]) =>
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
                    <SelectItem value="fields">Using Fields Below</SelectItem>
                    <SelectItem value="json">Using JSON</SelectItem>
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
                          setNodes((currentNodes: any[]) =>
                            currentNodes.map((node) =>
                              node.id === nodeEditor.nodeId
                                ? {
                                    ...node,
                                    data: {
                                      ...(node.data as WorkflowNodeData),
                                      queryParamsJsonType: "fixed",
                                    },
                                  }
                                : node
                            )
                          )
                        }}
                        className={`rounded px-2 py-0.5 ${
                          nodeEditor.queryParamsJsonType === "fixed"
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
                          setNodes((currentNodes: any[]) =>
                            currentNodes.map((node) =>
                              node.id === nodeEditor.nodeId
                                ? {
                                    ...node,
                                    data: {
                                      ...(node.data as WorkflowNodeData),
                                      queryParamsJsonType: "expression",
                                    },
                                  }
                                : node
                            )
                          )
                        }}
                        className={`rounded px-2 py-0.5 ${
                          nodeEditor.queryParamsJsonType === "expression"
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
                      setNodes((currentNodes: any[]) =>
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
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      const path = event.dataTransfer.getData("text/plain")
                      if (!path) return
                      const nextValue = appendExpression(
                        nodeEditor.queryParamsJson,
                        path
                      )
                      setNodeEditor((current) => ({
                        ...current,
                        queryParamsJson: nextValue,
                        queryParamsJsonType: "expression",
                        queryParamsSpecifierType: "expression",
                      }))
                      if (!nodeEditor.nodeId) return
                      setNodes((currentNodes: any[]) =>
                        currentNodes.map((node) =>
                          node.id === nodeEditor.nodeId
                            ? {
                                ...node,
                                data: {
                                  ...(node.data as WorkflowNodeData),
                                  queryParamsJson: nextValue,
                                  queryParamsJsonType: "expression",
                                  queryParamsSpecifierType: "expression",
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
                        setNodes((currentNodes: any[]) =>
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
                    {nodeEditor.queryParams.map((param, index) => (
                      <Accordion
                        key={param.id}
                        type="single"
                        collapsible
                        defaultValue={param.id}
                        className="group/param rounded-md border border-border px-3"
                      >
                        <AccordionItem value={param.id} className="border-none">
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
                                      (item) => item.id !== param.id
                                    )
                                  const normalizedParams =
                                    nextParams.length > 0
                                      ? nextParams
                                      : [
                                          {
                                            id: `qp-${Date.now()}`,
                                            name: "",
                                            value: "",
                                            valueType: "fixed" as const,
                                          },
                                        ]
                                  setNodeEditor((current) => ({
                                    ...current,
                                    queryParams: normalizedParams,
                                  }))
                                  if (!nodeEditor.nodeId) return
                                  setNodes((currentNodes: any[]) =>
                                    currentNodes.map((node) =>
                                      node.id === nodeEditor.nodeId
                                        ? {
                                            ...node,
                                            data: {
                                              ...(node.data as WorkflowNodeData),
                                              queryParams: normalizedParams,
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
                                      nodeEditor.queryParams.map((item) =>
                                        item.id === param.id
                                          ? {
                                              ...item,
                                              name: event.target.value,
                                            }
                                          : item
                                      )
                                    setNodeEditor((current) => ({
                                      ...current,
                                      queryParams: nextParams,
                                      queryParamsSpecifierType: "expression",
                                    }))
                                    if (!nodeEditor.nodeId) return
                                    setNodes((currentNodes: any[]) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? {
                                              ...node,
                                              data: {
                                                ...(node.data as WorkflowNodeData),
                                                queryParams: nextParams,
                                                queryParamsSpecifierType:
                                                  "expression",
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
                                    const nextParams =
                                      nodeEditor.queryParams.map((item) =>
                                        item.id === param.id
                                          ? {
                                              ...item,
                                              name: appendExpression(
                                                item.name,
                                                path
                                              ),
                                              valueType: "expression" as const,
                                            }
                                          : item
                                      )
                                    setNodeEditor((current) => ({
                                      ...current,
                                      queryParams: nextParams,
                                      queryParamsSpecifierType: "expression",
                                    }))
                                    if (!nodeEditor.nodeId) return
                                    setNodes((currentNodes: any[]) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? {
                                              ...node,
                                              data: {
                                                ...(node.data as WorkflowNodeData),
                                                queryParams: nextParams,
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
                                          nodeEditor.queryParams.map((item) =>
                                            item.id === param.id
                                              ? {
                                                  ...item,
                                                  valueType: "fixed" as const,
                                                }
                                              : item
                                          )
                                        setNodeEditor((current) => ({
                                          ...current,
                                          queryParams: nextParams,
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes: any[]) =>
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
                                      className={`rounded px-2 py-0.5 ${
                                        param.valueType === "fixed" ||
                                        !param.valueType
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
                                          nodeEditor.queryParams.map((item) =>
                                            item.id === param.id
                                              ? {
                                                  ...item,
                                                  valueType:
                                                    "expression" as const,
                                                }
                                              : item
                                          )
                                        setNodeEditor((current) => ({
                                          ...current,
                                          queryParams: nextParams,
                                        }))
                                        if (!nodeEditor.nodeId) return
                                        setNodes((currentNodes: any[]) =>
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
                                      className={`rounded px-2 py-0.5 ${
                                        param.valueType === "expression"
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
                                      nodeEditor.queryParams.map((item) =>
                                        item.id === param.id
                                          ? {
                                              ...item,
                                              value: event.target.value,
                                            }
                                          : item
                                      )
                                    setNodeEditor((current) => ({
                                      ...current,
                                      queryParams: nextParams,
                                    }))
                                    if (!nodeEditor.nodeId) return
                                    setNodes((currentNodes: any[]) =>
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
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={(event) => {
                                    event.preventDefault()
                                    const path =
                                      event.dataTransfer.getData("text/plain")
                                    if (!path) return
                                    const nextParams =
                                      nodeEditor.queryParams.map((item) =>
                                        item.id === param.id
                                          ? {
                                              ...item,
                                              value: appendExpression(
                                                item.value,
                                                path
                                              ),
                                              valueType: "expression" as const,
                                            }
                                          : item
                                      )
                                    setNodeEditor((current) => ({
                                      ...current,
                                      queryParams: nextParams,
                                    }))
                                    if (!nodeEditor.nodeId) return
                                    setNodes((currentNodes: any[]) =>
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
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
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
                setNodes((currentNodes: any[]) =>
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
                      setNodes((currentNodes: any[]) =>
                        currentNodes.map((node) =>
                          node.id === nodeEditor.nodeId
                            ? {
                                ...node,
                                data: {
                                  ...(node.data as WorkflowNodeData),
                                  headersSpecifierType: "fixed",
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
                      setNodes((currentNodes: any[]) =>
                        currentNodes.map((node) =>
                          node.id === nodeEditor.nodeId
                            ? {
                                ...node,
                                data: {
                                  ...(node.data as WorkflowNodeData),
                                  headersSpecifierType: "expression",
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
                  setNodes((currentNodes: any[]) =>
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
                  <SelectItem value="fields">Using Fields Below</SelectItem>
                  <SelectItem value="json">Using JSON</SelectItem>
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
                    setNodes((currentNodes: any[]) =>
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
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const path = event.dataTransfer.getData("text/plain")
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
                    setNodes((currentNodes: any[]) =>
                      currentNodes.map((node) =>
                        node.id === nodeEditor.nodeId
                          ? {
                              ...node,
                              data: {
                                ...(node.data as WorkflowNodeData),
                                headersJson: nextValue,
                                headersJsonType: "expression",
                                headersSpecifierType: "expression",
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
                          const nextHeaders = nodeEditor.headers.map((item) =>
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
                            headersSpecifierType: "expression",
                          }))
                          if (!nodeEditor.nodeId) return
                          setNodes((currentNodes: any[]) =>
                            currentNodes.map((node) =>
                              node.id === nodeEditor.nodeId
                                ? {
                                    ...node,
                                    data: {
                                      ...(node.data as WorkflowNodeData),
                                      headers: nextHeaders,
                                      headersSpecifierType: "expression",
                                    },
                                  }
                                : node
                            )
                          )
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          const path = event.dataTransfer.getData("text/plain")
                          if (!path) return
                          const nextHeaders = nodeEditor.headers.map((item) =>
                            item.id === header.id
                              ? {
                                  ...item,
                                  name: appendExpression(item.name, path),
                                  valueType: "expression" as const,
                                }
                              : item
                          )
                          setNodeEditor((current) => ({
                            ...current,
                            headers: nextHeaders,
                          }))
                          setNodeEditor((current) => ({
                            ...current,
                            headersSpecifierType: "expression",
                          }))
                          if (!nodeEditor.nodeId) return
                          setNodes((currentNodes: any[]) =>
                            currentNodes.map((node) =>
                              node.id === nodeEditor.nodeId
                                ? {
                                    ...node,
                                    data: {
                                      ...(node.data as WorkflowNodeData),
                                      headers: nextHeaders,
                                      headersSpecifierType: "expression",
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
                          const nextHeaders = nodeEditor.headers.map((item) =>
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
                          setNodes((currentNodes: any[]) =>
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
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          const path = event.dataTransfer.getData("text/plain")
                          if (!path) return
                          const nextHeaders = nodeEditor.headers.map((item) =>
                            item.id === header.id
                              ? {
                                  ...item,
                                  value: appendExpression(item.value, path),
                                  valueType: "expression" as const,
                                }
                              : item
                          )
                          setNodeEditor((current) => ({
                            ...current,
                            headers: nextHeaders,
                          }))
                          if (!nodeEditor.nodeId) return
                          setNodes((currentNodes: any[]) =>
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
                      setNodes((currentNodes: any[]) =>
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
                setNodes((currentNodes: any[]) =>
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
                      setNodes((currentNodes: any[]) =>
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
                      setNodes((currentNodes: any[]) =>
                        currentNodes.map((node) =>
                          node.id === nodeEditor.nodeId
                            ? {
                                ...node,
                                data: {
                                  ...(node.data as WorkflowNodeData),
                                  bodySpecifierType: "expression",
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
                  setNodes((currentNodes: any[]) =>
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
                  <SelectItem value="fields">Using Fields Below</SelectItem>
                  <SelectItem value="json">Using JSON</SelectItem>
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
                    setNodes((currentNodes: any[]) =>
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
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const path = event.dataTransfer.getData("text/plain")
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
                    setNodes((currentNodes: any[]) =>
                      currentNodes.map((node) =>
                        node.id === nodeEditor.nodeId
                          ? {
                              ...node,
                              data: {
                                ...(node.data as WorkflowNodeData),
                                bodyJson: nextValue,
                                bodyJsonType: "expression",
                                bodySpecifierType: "expression",
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
                  {nodeEditor.bodyFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-md border border-border p-2"
                    >
                      <p className="mb-1 text-xs text-muted-foreground">
                        {field.name || `Body Field ${index + 1}`}
                      </p>
                      <Input
                        value={field.name}
                        onChange={(event) => {
                          const nextFields = nodeEditor.bodyFields.map(
                            (item) =>
                              item.id === field.id
                                ? {
                                    ...item,
                                    name: event.target.value,
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
                          setNodes((currentNodes: any[]) =>
                            currentNodes.map((node) =>
                              node.id === nodeEditor.nodeId
                                ? {
                                    ...node,
                                    data: {
                                      ...(node.data as WorkflowNodeData),
                                      bodyFields: nextFields,
                                      bodySpecifierType: "expression",
                                    },
                                  }
                                : node
                            )
                          )
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          const path = event.dataTransfer.getData("text/plain")
                          if (!path) return
                          const nextFields = nodeEditor.bodyFields.map(
                            (item) =>
                              item.id === field.id
                                ? {
                                    ...item,
                                    name: appendExpression(item.name, path),
                                    valueType: "expression" as const,
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
                          setNodes((currentNodes: any[]) =>
                            currentNodes.map((node) =>
                              node.id === nodeEditor.nodeId
                                ? {
                                    ...node,
                                    data: {
                                      ...(node.data as WorkflowNodeData),
                                      bodyFields: nextFields,
                                      bodySpecifierType: "expression",
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
                          const nextFields = nodeEditor.bodyFields.map(
                            (item) =>
                              item.id === field.id
                                ? {
                                    ...item,
                                    value: event.target.value,
                                  }
                                : item
                          )
                          setNodeEditor((current) => ({
                            ...current,
                            bodyFields: nextFields,
                          }))
                          if (!nodeEditor.nodeId) return
                          setNodes((currentNodes: any[]) =>
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
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          const path = event.dataTransfer.getData("text/plain")
                          if (!path) return
                          const nextFields = nodeEditor.bodyFields.map(
                            (item) =>
                              item.id === field.id
                                ? {
                                    ...item,
                                    value: appendExpression(item.value, path),
                                    valueType: "expression" as const,
                                  }
                                : item
                          )
                          setNodeEditor((current) => ({
                            ...current,
                            bodyFields: nextFields,
                          }))
                          if (!nodeEditor.nodeId) return
                          setNodes((currentNodes: any[]) =>
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
                      setNodes((currentNodes: any[]) =>
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
  )
}
