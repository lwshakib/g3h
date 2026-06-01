import type { Edge, Node } from "@xyflow/react"
import {
  CalendarClockIcon,
  GlobeIcon,
  MousePointerIcon,
  WebhookIcon,
} from "lucide-react"
import {
  GeminiLogoIcon,
  OpenAiLogoIcon,
  AnthropicLogoIcon,
  TavilyLogoIcon,
} from "./icons"

export type WorkflowNodeData = {
  label: string
  method?: string
  url?: string
  inputSample?: string
  outputSample?: string
  sendQueryParams?: boolean
  queryParamsMode?: "fields" | "json"
  queryParamsSpecifierType?: "fixed" | "expression"
  queryParamsJson?: string
  queryParamsJsonType?: "fixed" | "expression"
  queryParams?: Array<{
    id: string
    name: string
    value: string
    valueType?: "fixed" | "expression"
  }>
  sendHeaders?: boolean
  headersMode?: "fields" | "json"
  headersSpecifierType?: "fixed" | "expression"
  headersJson?: string
  headersJsonType?: "fixed" | "expression"
  headers?: Array<{
    id: string
    name: string
    value: string
    valueType?: "fixed" | "expression"
  }>
  sendBody?: boolean
  bodyMode?: "fields" | "json"
  bodySpecifierType?: "fixed" | "expression"
  bodyJson?: string
  bodyJsonType?: "fixed" | "expression"
  bodyFields?: Array<{
    id: string
    name: string
    value: string
    valueType?: "fixed" | "expression"
  }>
}

export type NodeRunStatus = "initial" | "loading" | "success" | "error"

export type WorkflowEditorProps = {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  showChrome?: boolean
  onWorkflowChange?: (payload: { nodes: Node[]; edges: Edge[] }) => void
  onExecuteWorkflow?: (
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
  ) => Promise<{
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
  } | null>
}

export const TRIGGER_NODE_BORDER_STYLE: React.CSSProperties = {
  borderWidth: "2px 1px 2px 2px",
}

export const EDGE_TYPE = "buttonEdge"

export const defaultInitialNodes: Node[] = [
  {
    id: "initial-plus",
    position: { x: 120, y: 140 },
    data: { label: "Start" },
    type: "initialPlus",
  },
]

export const defaultInitialEdges: Edge[] = [
  { id: "e-start-step-1", source: "start", target: "step-1" },
]

export const nodeOptions = [
  {
    type: "manual-trigger",
    label: "Trigger manually",
    description: "Runs the flow when started manually.",
    icon: MousePointerIcon,
  },
  {
    type: "http-request",
    label: "HTTP Request",
    description: "Perform an HTTP request step.",
    icon: GlobeIcon,
  },
  {
    type: "gemini-execution",
    label: "Gemini",
    description: "Use Gemini model execution.",
    icon: GeminiLogoIcon,
  },
  {
    type: "chatgpt-execution",
    label: "ChatGPT",
    description: "Use ChatGPT model execution.",
    icon: OpenAiLogoIcon,
  },
  {
    type: "anthropic-execution",
    label: "Anthropic",
    description: "Use Anthropic model execution.",
    icon: AnthropicLogoIcon,
  },
  {
    type: "tavily-execution",
    label: "Tavily",
    description: "Use Tavily search execution.",
    icon: TavilyLogoIcon,
  },
  {
    type: "webhook-trigger",
    label: "Webhook call",
    description: "Runs the flow when a webhook is called.",
    icon: WebhookIcon,
  },
  {
    type: "schedule-trigger",
    label: "On schedule",
    description: "Runs the flow on a schedule.",
    icon: CalendarClockIcon,
  },
] as const

export const triggerNodeOptions = nodeOptions.filter(
  (option) =>
    option.type === "manual-trigger" ||
    option.type === "webhook-trigger" ||
    option.type === "schedule-trigger"
)

export const executionNodeOptions = nodeOptions.filter(
  (option) =>
    option.type === "http-request" ||
    option.type === "gemini-execution" ||
    option.type === "chatgpt-execution" ||
    option.type === "anthropic-execution" ||
    option.type === "tavily-execution"
)
