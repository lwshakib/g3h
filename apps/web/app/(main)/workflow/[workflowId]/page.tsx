"use client"

import * as React from "react"
import { WorkflowEditor } from "@/components/workflow-editor"
import type { Edge, Node } from "@xyflow/react"

type WorkflowPageProps = {
  params: Promise<{ workflowId: string }>
}

type WorkflowItem = {
  id: string
  name: string
  data?: {
    nodes?: Node[]
    edges?: Edge[]
  }
}

const getSessionToken = () => {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; axonix_session_token=`)
  const token = parts.length === 2 ? parts.pop()?.split(";").shift() ?? null : null
  return token
}

const getBackendBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }
  return baseUrl.replace(/\/+$/, "")
}

export default function WorkflowByIdPage({ params }: WorkflowPageProps) {
  const { workflowId } = React.use(params)
  const [workflowName, setWorkflowName] = React.useState<string>(workflowId)
  const [initialNodes, setInitialNodes] = React.useState<Node[] | undefined>(
    undefined
  )
  const [initialEdges, setInitialEdges] = React.useState<Edge[] | undefined>(
    undefined
  )
  const [isReady, setIsReady] = React.useState(false)
  const pendingSaveRef = React.useRef<{ nodes: Node[]; edges: Edge[] } | null>(
    null
  )
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = React.useRef(false)
  const lastSavedPayloadRef = React.useRef<string>("")

  React.useEffect(() => {
    const run = async () => {
      const token = getSessionToken()
      if (!token) return

      try {
        const response = await fetch(`/api/workflow/${workflowId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) return
        const payload = await response.json()
        const current: WorkflowItem | undefined = payload.workflow
        if (current?.name) {
          setWorkflowName(current.name)
        }
        if (current?.data && Array.isArray(current.data.nodes)) {
          setInitialNodes(current.data.nodes)
        }
        if (current?.data && Array.isArray(current.data.edges)) {
          setInitialEdges(current.data.edges)
        }
      } catch (error) {
        console.error("[WorkflowPage] Failed to resolve workflow name:", error)
      } finally {
        setIsReady(true)
      }
    }

    void run()
  }, [workflowId])

  const flushPersist = React.useCallback(async () => {
    if (isSavingRef.current || !pendingSaveRef.current) return
    const payload = pendingSaveRef.current
    const serialized = JSON.stringify(payload)
    if (serialized === lastSavedPayloadRef.current) {
      pendingSaveRef.current = null
      return
    }

    const token = getSessionToken()
    if (!token) return

    isSavingRef.current = true
    pendingSaveRef.current = null

    try {
      await fetch(`/api/workflow/${workflowId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: payload,
        }),
      })
      lastSavedPayloadRef.current = serialized
    } catch (error) {
      console.error("[WorkflowPage] Failed to persist workflow:", error)
      // Keep last payload queued for retry on next change tick
      pendingSaveRef.current = payload
    } finally {
      isSavingRef.current = false
      if (pendingSaveRef.current) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
          void flushPersist()
        }, 600)
      }
    }
  }, [workflowId])

  const persistWorkflow = React.useCallback(
    async (payload: { nodes: Node[]; edges: Edge[] }) => {
      const sanitizedNodes = payload.nodes.map((node) => {
        const data = (node.data ?? {}) as Record<string, unknown>
        const {
          inputSample: _inputSample,
          outputSample: _outputSample,
          ...restData
        } = data
        return {
          ...node,
          data: restData,
        }
      })

      pendingSaveRef.current = {
        nodes: sanitizedNodes,
        edges: payload.edges,
      }
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        void flushPersist()
      }, 450)
    },
    [flushPersist]
  )

  const executeWorkflow = React.useCallback(
    async (
      onStatus: (status: {
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
      }) => void,
      options?: { targetNodeId?: string }
    ) => {
      const token = getSessionToken()
      if (!token) return null

      const executeViaApi = async () => {
        const response = await fetch(`/api/workflow/${workflowId}/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetNodeId: options?.targetNodeId,
          }),
        })
        if (!response.ok) {
          throw new Error(`Execute API failed with status ${response.status}`)
        }

        const payload = await response.json()
        const run = payload?.run
        if (!run) return null

        const statuses = Array.isArray(run.statuses) ? run.statuses : []
        for (const status of statuses) {
          onStatus(status)
        }

        return {
          workflowId: String(run.workflowId ?? workflowId),
          executedAt: String(run.executedAt ?? new Date().toISOString()),
          statuses,
        }
      }

      try {
        const streamUrl = new URL(
          `${getBackendBaseUrl()}/workflow/${workflowId}/execute/stream`
        )
        streamUrl.searchParams.set("token", token)
        if (options?.targetNodeId) {
          streamUrl.searchParams.set("targetNodeId", options.targetNodeId)
        }

        return await new Promise<{
          workflowId: string
          executedAt: string
          statuses: Array<{
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
        } | null>((resolve) => {
          const eventSource = new EventSource(streamUrl.toString())
          let hasAnyNodeStatus = false
          let settled = false

          const finishWithFallback = async () => {
            if (settled) return
            settled = true
            eventSource.close()
            try {
              const fallbackResult = await executeViaApi()
              resolve(fallbackResult)
            } catch {
              resolve(null)
            }
          }

          eventSource.addEventListener("node-status", (event) => {
            try {
              const data = JSON.parse((event as MessageEvent).data)
              hasAnyNodeStatus = true
              onStatus(data)
            } catch (error) {
              console.error(
                "[WorkflowPage] Invalid node-status payload:",
                error
              )
            }
          })

          eventSource.addEventListener("completed", (event) => {
            if (settled) return
            settled = true
            try {
              const data = JSON.parse((event as MessageEvent).data)
              if (!hasAnyNodeStatus && Array.isArray(data?.statuses)) {
                for (const status of data.statuses) {
                  onStatus(status)
                }
              }
              resolve(data)
            } catch {
              resolve(null)
            } finally {
              eventSource.close()
            }
          })

          eventSource.addEventListener("error", () => {
            void finishWithFallback()
          })
        })
      } catch (error) {
        console.error("[WorkflowPage] Execute workflow failed:", error)
        try {
          return await executeViaApi()
        } catch {
          return null
        }
      }
    },
    [workflowId]
  )

  return (
    <div className="relative flex h-full w-full flex-col">
      {isReady && (
        <div className="absolute top-4 left-4 z-50 rounded-lg border border-border px-3 py-1.5 text-foreground shadow-sm">
          <span className="text-[11px] font-semibold select-none">
            {workflowName}
          </span>
        </div>
      )}
      <div className="min-h-0 flex-1">
        {isReady && (
          <WorkflowEditor
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            onWorkflowChange={persistWorkflow}
            onExecuteWorkflow={executeWorkflow}
          />
        )}
      </div>
    </div>
  )
}
