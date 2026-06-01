import type { Node } from "@xyflow/react"
import type { WorkflowNodeData } from "./types"

export const isNodeConfigured = (
  nodeType: string,
  data: WorkflowNodeData
): boolean => {
  if (nodeType === "httpRequest") {
    return Boolean(data.url?.trim())
  }
  return true
}

export const getUnconfiguredNodes = (workflowNodes: Node[]): Node[] =>
  workflowNodes.filter((node) => {
    if (!node.type || node.type === "initialPlus") return false
    return !isNodeConfigured(node.type, (node.data ?? {}) as WorkflowNodeData)
  })

export const getExpressionPaths = (value: unknown, prefix = ""): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) {
    if (value.length === 0) return [prefix || "items"]
    return getExpressionPaths(value[0], prefix ? `${prefix}[0]` : "[0]")
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return [prefix || "object"]
    return entries.flatMap(([key, child]) =>
      getExpressionPaths(child, prefix ? `${prefix}.${key}` : key)
    )
  }
  return [prefix || "value"]
}

export const appendExpression = (current: string, path: string): string =>
  `${current}${current.trim().length ? " " : ""}{{ $json.${path} }}`

export const getJsonType = (value: unknown): string => {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  return typeof value
}

export const formatCellValue = (value: unknown): string => {
  if (value === null) return "null"
  if (value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean")
    return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return "[unserializable]"
  }
}

export const getOutputItemCount = (parsedOutput: unknown | null): number => {
  if (parsedOutput === null) return 0
  if (Array.isArray(parsedOutput)) return parsedOutput.length
  if (getJsonType(parsedOutput) === "object") {
    return Object.keys(parsedOutput as Record<string, unknown>).length
  }
  return 1
}

export function deleteNodeAndConnections(
  nodeId: string,
  setNodes: ReturnType<typeof import("@xyflow/react").useReactFlow>["setNodes"],
  setEdges: ReturnType<typeof import("@xyflow/react").useReactFlow>["setEdges"],
  getNodes: ReturnType<typeof import("@xyflow/react").useReactFlow>["getNodes"]
) {
  setEdges((currentEdges: import("@xyflow/react").Edge[]) => {
    const currentNodes = getNodes()
    const incomingEdges = currentEdges.filter((edge) => edge.target === nodeId)
    const outgoingEdges = currentEdges.filter((edge) => edge.source === nodeId)

    const remainingEdges = currentEdges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )

    const bridgeEdges: import("@xyflow/react").Edge[] = []
    for (const incoming of incomingEdges) {
      for (const outgoing of outgoingEdges) {
        if (!incoming.source || !outgoing.target) continue
        if (incoming.source === outgoing.target) continue

        const sourceExists = currentNodes.some(
          (node) => node.id === incoming.source
        )
        const targetExists = currentNodes.some(
          (node) => node.id === outgoing.target
        )
        if (!sourceExists || !targetExists) continue

        const alreadyExists =
          remainingEdges.some(
            (edge) =>
              edge.source === incoming.source && edge.target === outgoing.target
          ) ||
          bridgeEdges.some(
            (edge) =>
              edge.source === incoming.source && edge.target === outgoing.target
          )

        if (!alreadyExists) {
          bridgeEdges.push({
            id: `e-${incoming.source}-${outgoing.target}`,
            source: incoming.source,
            target: outgoing.target,
            type: "buttonEdge",
            style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
          })
        }
      }
    }

    return [...remainingEdges, ...bridgeEdges]
  })

  setNodes((currentNodes: import("@xyflow/react").Node[]) => {
    const remainingNodes = currentNodes.filter((node) => node.id !== nodeId)
    const hasWorkflowNodes = remainingNodes.some(
      (node) => node.type !== "initialPlus"
    )

    if (!hasWorkflowNodes) {
      return [
        {
          id: "initial-plus",
          position: { x: 120, y: 140 },
          data: { label: "Start" },
          type: "initialPlus",
        },
      ]
    }

    return remainingNodes
  })
}
