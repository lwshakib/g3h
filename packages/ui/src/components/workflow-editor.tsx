"use client";

import * as React from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
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
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Switch } from "./ui/switch";
import { toast } from "sonner";

type WorkflowEditorProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  showChrome?: boolean;
  onWorkflowChange?: (payload: { nodes: Node[]; edges: Edge[] }) => void;
  onExecuteWorkflow?: (onStatus: (status: {
    nodeId: string;
    label: string;
    status: "running" | "success" | "error" | "skipped";
    message?: string;
    statusCode?: number;
    output?: string;
  }) => void, options?: { targetNodeId?: string }) => Promise<{
    statuses: Array<{
      nodeId: string;
      label: string;
      status: "running" | "success" | "error" | "skipped";
      message?: string;
      statusCode?: number;
      output?: string;
    }>;
  } | null>;
};

type WorkflowNodeData = {
  label: string;
  method?: string;
  url?: string;
  inputSample?: string;
  outputSample?: string;
  sendQueryParams?: boolean;
  queryParamsMode?: "fields" | "json";
  queryParamsSpecifierType?: "fixed" | "expression";
  queryParamsJson?: string;
  queryParamsJsonType?: "fixed" | "expression";
  queryParams?: Array<{
    id: string;
    name: string;
    value: string;
    valueType?: "fixed" | "expression";
  }>;
  sendHeaders?: boolean;
  headersMode?: "fields" | "json";
  headersSpecifierType?: "fixed" | "expression";
  headersJson?: string;
  headersJsonType?: "fixed" | "expression";
  headers?: Array<{
    id: string;
    name: string;
    value: string;
    valueType?: "fixed" | "expression";
  }>;
  sendBody?: boolean;
  bodyMode?: "fields" | "json";
  bodySpecifierType?: "fixed" | "expression";
  bodyJson?: string;
  bodyJsonType?: "fixed" | "expression";
  bodyFields?: Array<{
    id: string;
    name: string;
    value: string;
    valueType?: "fixed" | "expression";
  }>;
};

type NodeRunStatus = "initial" | "loading" | "success" | "error";
const TRIGGER_NODE_BORDER_STYLE: React.CSSProperties = {
  borderWidth: "2px 1px 2px 2px",
};

const isNodeConfigured = (nodeType: string, data: WorkflowNodeData): boolean => {
  if (nodeType === "httpRequest") {
    return Boolean(data.url?.trim());
  }
  return true;
};

const getUnconfiguredNodes = (workflowNodes: Node[]): Node[] =>
  workflowNodes.filter((node) => {
    if (!node.type || node.type === "initialPlus") return false;
    return !isNodeConfigured(node.type, (node.data ?? {}) as WorkflowNodeData);
  });

const getExpressionPaths = (value: unknown, prefix = ""): string[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    if (value.length === 0) return [prefix || "items"];
    return getExpressionPaths(value[0], prefix ? `${prefix}[0]` : "[0]");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [prefix || "object"];
    return entries.flatMap(([key, child]) =>
      getExpressionPaths(child, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [prefix || "value"];
};

const appendExpression = (current: string, path: string): string =>
  `${current}${current.trim().length ? " " : ""}{{ $json.${path} }}`;

function NodeConfigIndicator({
  configured,
  runStatus,
}: {
  configured: boolean;
  runStatus: NodeRunStatus;
}) {
  if (runStatus === "loading") {
    return (
      <Loader2Icon
        className="pointer-events-none absolute bottom-2 right-2 z-30 h-4 w-4 animate-spin text-[#2a43e9]"
        aria-hidden="true"
      />
    );
  }

  if (runStatus === "success") {
    return (
      <CheckCircle2Icon
        className="pointer-events-none absolute bottom-2 right-2 z-30 h-4 w-4 text-emerald-500"
        aria-hidden="true"
      />
    );
  }

  if (runStatus === "error") {
    return (
      <CircleXIcon
        className="pointer-events-none absolute bottom-2 right-2 z-30 h-4 w-4 text-red-500"
        aria-hidden="true"
      />
    );
  }

  if (configured) return null;

  return (
    <AlertTriangleIcon
      className="pointer-events-none absolute bottom-2 right-2 z-30 h-4 w-4 text-red-500"
      aria-hidden="true"
    />
  );
}

const getJsonType = (value: unknown): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

const formatCellValue = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
};

const schemaTypeBadge = (value: unknown) => {
  const type = getJsonType(value);
  if (type === "object" || type === "array") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-background text-[10px] text-muted-foreground">
        <GlobeIcon className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-background text-[10px] font-medium text-muted-foreground">
      T
    </span>
  );
};

function SchemaTreeNode({
  field,
  value,
  depth = 0,
}: {
  field: string;
  value: unknown;
  depth?: number;
}) {
  const type = getJsonType(value);
  const isExpandable =
    type === "object" ? Object.keys((value ?? {}) as Record<string, unknown>).length > 0
    : type === "array" ? (value as unknown[]).length > 0
    : false;
  const [expanded, setExpanded] = React.useState(true);

  const valueText =
    type === "object"
      ? ""
      : type === "array"
        ? `${(value as unknown[]).length} item(s)`
        : formatCellValue(value);

  const children: Array<[string, unknown]> =
    type === "object"
      ? Object.entries((value ?? {}) as Record<string, unknown>)
      : type === "array"
        ? (value as unknown[]).map((item, index) => [`[${index}]`, item] as [string, unknown])
        : [];

  return (
    <div>
      <div
        className="flex min-h-8 items-center justify-between px-2 py-1 text-sm hover:bg-muted/20"
        style={{ paddingLeft: `${depth * 18 + 6}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isExpandable ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="inline-block h-4 w-4" />
          )}
          {schemaTypeBadge(value)}
          <span className="text-sm font-medium text-foreground">{field}</span>
        </div>
        <span className="ml-4 max-w-[55%] truncate text-sm text-muted-foreground">{valueText}</span>
      </div>

      {isExpandable && expanded && (
        <div>
          {children.map(([childField, childValue]) => (
            <SchemaTreeNode
              key={`${field}-${childField}-${depth}`}
              field={childField}
              value={childValue}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OutputSchemaTab({
  parsedOutput,
}: {
  parsedOutput: unknown | null;
}) {
  if (parsedOutput === null) {
    return (
      <div className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
        Output is not valid JSON yet. Run the workflow to view schema.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto rounded-md bg-background/40 py-1">
      <SchemaTreeNode
        field={Array.isArray(parsedOutput) ? "[0]" : "root"}
        value={Array.isArray(parsedOutput) ? parsedOutput[0] ?? {} : parsedOutput}
      />
    </div>
  );
}

function OutputTableTab({ parsedOutput }: { parsedOutput: unknown | null }) {
  if (parsedOutput === null) {
    return (
      <div className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
        Output is not valid JSON yet. Run the workflow to view table data.
      </div>
    );
  }

  const rows = Array.isArray(parsedOutput)
    ? parsedOutput
    : getJsonType(parsedOutput) === "object"
      ? [parsedOutput]
      : [{ value: parsedOutput }];

  const objectRows = rows.map((row) =>
    getJsonType(row) === "object" ? (row as Record<string, unknown>) : ({ value: row } as Record<string, unknown>)
  );

  const columns = Array.from(
    objectRows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>())
  );

  return (
    <div className="h-full overflow-auto rounded-md bg-background/40">
      <table className="min-w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-muted/30">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-r border-border px-3 py-2 text-left font-semibold text-foreground">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {objectRows.map((row, index) => (
            <tr key={`output-row-${index}`} className="align-top">
              {columns.map((column) => (
                <td key={`${index}-${column}`} className="border-b border-r border-border px-3 py-2 text-muted-foreground">
                  <div className="max-w-[300px] break-words">{formatCellValue(row[column])}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const getOutputItemCount = (parsedOutput: unknown | null): number => {
  if (parsedOutput === null) return 0;
  if (Array.isArray(parsedOutput)) return parsedOutput.length;
  if (getJsonType(parsedOutput) === "object") {
    return Object.keys(parsedOutput as Record<string, unknown>).length;
  }
  return 1;
};

function OutputTabsPanel({
  parsedOutput,
  prettyJsonOutput,
  hasOutput,
  isExecuting,
  onExecuteStep,
}: {
  parsedOutput: unknown | null;
  prettyJsonOutput: string;
  hasOutput: boolean;
  isExecuting: boolean;
  onExecuteStep: (targetNodeId?: string) => void;
}) {
  const [activeTab, setActiveTab] = React.useState("schema");
  const itemCount = getOutputItemCount(parsedOutput);

  if (!hasOutput) {
    return (
      <div className="flex h-full min-w-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card p-4">
        <Button onClick={() => onExecuteStep()} disabled={isExecuting}>
          {isExecuting ? "Running..." : "Execute step"}
        </Button>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full min-w-0 overflow-hidden rounded-md border border-border bg-card"
    >
      <div className="flex min-w-0 items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-[0.18em] text-foreground/80">OUTPUT</span>
          <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
          <button
            type="button"
            aria-label="Search output"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <SearchIcon className="h-3.5 w-3.5" />
          </button>
          <TabsList className="h-8 rounded-md bg-muted p-0.5">
            <TabsTrigger value="schema" className="h-7 px-3 text-xs">
              Schema
            </TabsTrigger>
            <TabsTrigger value="table" className="h-7 px-3 text-xs">
              Table
            </TabsTrigger>
            <TabsTrigger value="json" className="h-7 px-3 text-xs">
              JSON
            </TabsTrigger>
          </TabsList>
          <button
            type="button"
            aria-label="Edit output"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
        {itemCount} item{itemCount === 1 ? "" : "s"}
      </div>

      <div className="h-[calc(100%-74px)] min-w-0 overflow-hidden p-2">
        <TabsContent value="schema" className="mt-0 h-full min-w-0 overflow-hidden">
          <OutputSchemaTab parsedOutput={parsedOutput} />
        </TabsContent>
        <TabsContent value="table" className="mt-0 h-full min-w-0 overflow-hidden">
          <OutputTableTab parsedOutput={parsedOutput} />
        </TabsContent>
        <TabsContent value="json" className="mt-0 h-full min-w-0 overflow-hidden">
          <div className="h-full overflow-auto rounded-md bg-background/40 p-3 font-mono text-xs text-foreground">
            <pre className="max-w-full whitespace-pre-wrap break-words">{prettyJsonOutput || "{}"}</pre>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}

function InputTabsPanel({
  parsedInput,
  prettyJsonInput,
  hasInput,
  isExecuting,
  onExecutePreviousStep,
  previousNodeType,
}: {
  parsedInput: unknown | null;
  prettyJsonInput: string;
  hasInput: boolean;
  isExecuting: boolean;
  onExecutePreviousStep: () => void;
  previousNodeType?: string;
}) {
  const [activeTab, setActiveTab] = React.useState("schema");
  const itemCount = getOutputItemCount(parsedInput);
  const isPreviousTrigger =
    previousNodeType === "manualTrigger" ||
    previousNodeType === "manual-trigger" ||
    previousNodeType === "webhookTrigger" ||
    previousNodeType === "webhook-trigger" ||
    previousNodeType === "scheduleTrigger" ||
    previousNodeType === "schedule-trigger";

  if (isPreviousTrigger) {
    return (
      <div className="h-full min-w-0 overflow-auto rounded-md border border-border bg-card p-3">
        <Accordion type="single" collapsible defaultValue="trigger-input">
          <AccordionItem value="trigger-input" className="border-border">
            <AccordionTrigger className="py-2 text-sm">When clicking "Execute workflow"</AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground">
              No fields. Node executed, but no items were sent from trigger output.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  if (!hasInput) {
    return (
      <div className="flex h-full min-w-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card p-4">
        <Button onClick={onExecutePreviousStep} disabled={isExecuting}>
          {isExecuting ? "Running..." : "Execute previous step"}
        </Button>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full min-w-0 overflow-hidden rounded-md border border-border bg-card"
    >
      <div className="flex min-w-0 items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-[0.18em] text-foreground/80">INPUT</span>
          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <TabsList className="h-8 rounded-md bg-muted p-0.5">
          <TabsTrigger value="schema" className="h-7 px-3 text-xs">
            Schema
          </TabsTrigger>
          <TabsTrigger value="table" className="h-7 px-3 text-xs">
            Table
          </TabsTrigger>
          <TabsTrigger value="json" className="h-7 px-3 text-xs">
            JSON
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
        {itemCount} item{itemCount === 1 ? "" : "s"}
      </div>

      <div className="h-[calc(100%-74px)] min-w-0 overflow-hidden p-2">
        <TabsContent value="schema" className="mt-0 h-full min-w-0 overflow-hidden">
          <OutputSchemaTab parsedOutput={parsedInput} />
        </TabsContent>
        <TabsContent value="table" className="mt-0 h-full min-w-0 overflow-hidden">
          <OutputTableTab parsedOutput={parsedInput} />
        </TabsContent>
        <TabsContent value="json" className="mt-0 h-full min-w-0 overflow-hidden">
          <div className="h-full overflow-auto rounded-md bg-background/40 p-3 font-mono text-xs text-foreground">
            <pre className="max-w-full whitespace-pre-wrap break-words">{prettyJsonInput || "{}"}</pre>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}

function NodeStatusBorder({
  status,
}: {
  status: NodeRunStatus;
}) {
  if (status === "initial") return null;

  if (status === "loading") {
    return (
      <>
        <style>
          {`
            @keyframes workflow-node-border-spin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .workflow-node-border-spinner {
              animation: workflow-node-border-spin 2s linear infinite;
              position: absolute;
              left: 50%;
              top: 50%;
              width: 140%;
              aspect-ratio: 1;
              transform-origin: center;
            }
          `}
        </style>
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] bg-[#161616]" />
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] overflow-hidden rounded-[30px]">
          <div className="workflow-node-border-spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgb(42,67,233)_0deg,rgba(42,138,246,0)_360deg)]" />
        </div>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] bg-[#161616]" />
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] border-[3px] border-emerald-600/60" />
      </>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] bg-[#161616]" />
      <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] border-[3px] border-red-600/60" />
    </>
  );
}

const EDGE_TYPE = "buttonEdge";

function GeminiLogoIcon({ className }: { className?: string }) {
  return <img src="/logos/gemini.svg" alt="Gemini" className={className} />;
}

function OpenAiLogoIcon({ className }: { className?: string }) {
  return <img src="/logos/openai.svg" alt="OpenAI" className={className} />;
}

function AnthropicLogoIcon({ className }: { className?: string }) {
  return <img src="/logos/anthropic.svg" alt="Anthropic" className={className} />;
}

function TavilyLogoIcon({ className }: { className?: string }) {
  return <img src="/logos/tavily.svg" alt="Tavily" className={className} />;
}

function deleteNodeAndConnections(
  nodeId: string,
  setNodes: ReturnType<typeof useReactFlow>["setNodes"],
  setEdges: ReturnType<typeof useReactFlow>["setEdges"],
  getNodes: ReturnType<typeof useReactFlow>["getNodes"]
) {
  setEdges((currentEdges: Edge[]) => {
    const currentNodes = getNodes();
    const incomingEdges = currentEdges.filter((edge) => edge.target === nodeId);
    const outgoingEdges = currentEdges.filter((edge) => edge.source === nodeId);

    const remainingEdges = currentEdges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );

    // Bridge previous and next nodes when a middle node is removed.
    const bridgeEdges: Edge[] = [];
    for (const incoming of incomingEdges) {
      for (const outgoing of outgoingEdges) {
        if (!incoming.source || !outgoing.target) continue;
        if (incoming.source === outgoing.target) continue;

        const sourceExists = currentNodes.some((node) => node.id === incoming.source);
        const targetExists = currentNodes.some((node) => node.id === outgoing.target);
        if (!sourceExists || !targetExists) continue;

        const alreadyExists =
          remainingEdges.some(
            (edge) => edge.source === incoming.source && edge.target === outgoing.target
          ) ||
          bridgeEdges.some(
            (edge) => edge.source === incoming.source && edge.target === outgoing.target
          );

        if (!alreadyExists) {
          bridgeEdges.push({
            id: `e-${incoming.source}-${outgoing.target}`,
            source: incoming.source,
            target: outgoing.target,
            type: EDGE_TYPE,
            style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
          });
        }
      }
    }

    return [...remainingEdges, ...bridgeEdges];
  });

  setNodes((currentNodes: Node[]) => {
    const remainingNodes = currentNodes.filter((node) => node.id !== nodeId);
    const hasWorkflowNodes = remainingNodes.some((node) => node.type !== "initialPlus");

    if (!hasWorkflowNodes) {
      return [
        {
          id: "initial-plus",
          position: { x: 120, y: 140 },
          data: { label: "Start" },
          type: "initialPlus",
        },
      ];
    }

    return remainingNodes;
  });
}

const SelectorContext = React.createContext<{
  openSelector: (sourceNodeId?: string, mode?: "all" | "executions") => void;
  openNodeEditor: (nodeId: string, label: string, kind: "Trigger" | "Execution") => void;
  getNodeStatus: (nodeId: string) => NodeRunStatus;
  connectingFromNodeId: string | null;
} | null>(null);

const EdgeActionsContext = React.createContext<{
  onEdgeInsert: (edgeId: string, source: string, target: string) => void;
  onEdgeDelete: (edgeId: string) => void;
} | null>(null);

function ButtonEdge({
  id,
  source,
  target,
  style,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps<Edge>) {
  const actions = React.useContext(EdgeActionsContext);
  const [isHovered, setIsHovered] = React.useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          className={`nodrag nopan absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ left: labelX, top: labelY }}
        >
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              type="button"
              onClick={(event) => {
                handleClick(event);
                actions?.onEdgeInsert(id, source, target);
              }}
              className="pointer-events-auto rounded-md border border-[#3f3f3f] bg-[#1b1b1b] p-1 text-[#cfcfcf] shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#2a2a2a] hover:text-white"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                handleClick(event);
                actions?.onEdgeDelete(id);
              }}
              className="pointer-events-auto rounded-md border border-[#3f3f3f] bg-[#1b1b1b] p-1 text-[#cfcfcf] shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#2a2a2a] hover:text-white"
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function NodeTopToolbar({ onDelete }: { onDelete: () => void }) {
  const handleToolbarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="pointer-events-none absolute left-1/2 top-[-44px] z-20 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/node:opacity-100">
      <div className="pointer-events-auto flex items-center gap-1 text-[#e6e6e6]">
        <button type="button" onClick={handleToolbarClick} className="rounded p-1 hover:bg-white/10">
          <PlayIcon className="h-3.5 w-3.5 fill-current" />
        </button>
        <button type="button" onClick={handleToolbarClick} className="rounded p-1 hover:bg-white/10">
          <PowerIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            handleToolbarClick(event);
            onDelete();
          }}
          className="rounded p-1 hover:bg-white/10"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={handleToolbarClick} className="rounded p-1 hover:bg-white/10">
          <SparklesIcon className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={handleToolbarClick} className="rounded p-1 hover:bg-white/10">
          <EllipsisIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function InitialPlusNode() {
  const ctx = React.useContext(SelectorContext);

  return (
    <div className="rounded-md bg-transparent px-2 py-1">
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-3">
          <button
            className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/60 bg-card/40 text-muted-foreground hover:border-primary/70 hover:text-primary"
            onClick={() => ctx?.openSelector()}
          >
            <PlusIcon className="size-10" />
          </button>
          <p className="text-xs font-medium text-foreground">Add first step...</p>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">or</div>

        <div className="flex flex-col items-center gap-3">
          <button
            className="flex h-24 w-24 cursor-default items-center justify-center rounded-md border border-dashed border-muted-foreground/60 bg-card/40 text-muted-foreground"
            type="button"
          >
            <WandSparklesIcon className="size-10" />
          </button>
          <p className="text-xs font-medium text-foreground">Build with AI</p>
        </div>
      </div>
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} isConnectable={false} />
    </div>
  );
}

function ManualTriggerNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("manualTrigger", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Trigger")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div
          className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          style={TRIGGER_NODE_BORDER_STYLE}
        >
          <NodeStatusBorder status={runStatus} />
          <MousePointerIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />

          {/* Visible connection source exactly on border center */}
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />

          {/* Add-step affordance hidden once already connected */}
          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          When clicking &lsquo;Execute workflow&rsquo;
        </p>
      )}

    </div>
  );
}

function WebhookTriggerNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("webhookTrigger", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Trigger")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div
          className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          style={TRIGGER_NODE_BORDER_STYLE}
        >
          <NodeStatusBorder status={runStatus} />
          <WebhookIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          {data.label}
        </p>
      )}
    </div>
  );
}

function ScheduleTriggerNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("scheduleTrigger", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Trigger")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div
          className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          style={TRIGGER_NODE_BORDER_STYLE}
        >
          <NodeStatusBorder status={runStatus} />
          <CalendarClockIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          {data.label}
        </p>
      )}
    </div>
  );
}

function HttpRequestNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("httpRequest", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Execution")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <NodeStatusBorder status={runStatus} />
          <GlobeIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />

          <Handle
            type="target"
            position={Position.Left}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />

          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />

          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          {data.label}
        </p>
      )}
    </div>
  );
}

function GeminiExecutionNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("geminiExecution", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Execution")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <NodeStatusBorder status={runStatus} />
          <GeminiLogoIcon className="h-11 w-11" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />
          <Handle
            type="target"
            position={Position.Left}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          {data.label}
        </p>
      )}
    </div>
  );
}

function ChatGptExecutionNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("chatGptExecution", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Execution")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <NodeStatusBorder status={runStatus} />
          <OpenAiLogoIcon className="h-11 w-11" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />
          <Handle
            type="target"
            position={Position.Left}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          {data.label}
        </p>
      )}
    </div>
  );
}

function AnthropicExecutionNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("anthropicExecution", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Execution")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <NodeStatusBorder status={runStatus} />
          <AnthropicLogoIcon className="h-11 w-11" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />
          <Handle
            type="target"
            position={Position.Left}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          {data.label}
        </p>
      )}
    </div>
  );
}

function TavilyExecutionNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;
  const runStatus = ctx?.getNodeStatus(id) ?? "initial";
  const configured = isNodeConfigured("tavilyExecution", data);

  return (
    <div
      className="group/node relative w-[244px]"
      onDoubleClick={() => ctx?.openNodeEditor(id, data.label, "Execution")}
    >
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges, getNodes)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <NodeStatusBorder status={runStatus} />
          <TavilyLogoIcon className="h-11 w-11" />
          <NodeConfigIndicator configured={configured} runStatus={runStatus} />
          <Handle
            type="target"
            position={Position.Left}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />
          {showAddAffordance && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              <button
                type="button"
                onClick={() => ctx?.openSelector(id, "executions")}
                className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
              >
                <PlusIcon className="size-3.5 stroke-[2.4]" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isConnectingFromThisNode && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          {data.label}
        </p>
      )}
    </div>
  );
}

const defaultInitialNodes: Node[] = [
  {
    id: "initial-plus",
    position: { x: 120, y: 140 },
    data: { label: "Start" },
    type: "initialPlus",
  },
];

const defaultInitialEdges: Edge[] = [{ id: "e-start-step-1", source: "start", target: "step-1" }];

const nodeOptions = [
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
] as const;

const triggerNodeOptions = nodeOptions.filter(
  (option) =>
    option.type === "manual-trigger" ||
    option.type === "webhook-trigger" ||
    option.type === "schedule-trigger"
);
const executionNodeOptions = nodeOptions.filter(
  (option) =>
    option.type === "http-request" ||
    option.type === "gemini-execution" ||
    option.type === "chatgpt-execution" ||
    option.type === "anthropic-execution" ||
    option.type === "tavily-execution"
);

export function WorkflowEditor({
  initialNodes = defaultInitialNodes,
  initialEdges = defaultInitialEdges,
  showChrome = true,
  onWorkflowChange,
  onExecuteWorkflow,
}: WorkflowEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const colorMode = mounted
    ? (resolvedTheme === "dark" ? "dark" : "light")
    : undefined;
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [selectorMode, setSelectorMode] = React.useState<"all" | "executions">("all");
  const [pendingSourceNodeId, setPendingSourceNodeId] = React.useState<string | null>(null);
  const [pendingEdgeInsert, setPendingEdgeInsert] = React.useState<{
    edgeId: string;
    source: string;
    target: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [lastExecutedAt, setLastExecutedAt] = React.useState<string | null>(null);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [nodeStatuses, setNodeStatuses] = React.useState<Record<string, NodeRunStatus>>({});
  const [executionStatuses, setExecutionStatuses] = React.useState<
    Array<{
      nodeId: string;
      label: string;
      status: "running" | "success" | "error" | "skipped";
      message?: string;
      statusCode?: number;
      output?: string;
    }>
  >([]);
  const [connectingFromNodeId, setConnectingFromNodeId] = React.useState<string | null>(null);
  const [nodeEditor, setNodeEditor] = React.useState<{
    isOpen: boolean;
    nodeId: string | null;
    kind: "Trigger" | "Execution";
    nodeType: string | null;
    value: string;
    method: string;
    url: string;
    inputSample: string;
    outputSample: string;
    sendQueryParams: boolean;
    queryParamsMode: "fields" | "json";
    queryParamsSpecifierType: "fixed" | "expression";
    queryParamsJson: string;
    queryParamsJsonType: "fixed" | "expression";
    queryParams: Array<{
      id: string;
      name: string;
      value: string;
      valueType: "fixed" | "expression";
    }>;
    sendHeaders: boolean;
    headersMode: "fields" | "json";
    headersSpecifierType: "fixed" | "expression";
    headersJson: string;
    headersJsonType: "fixed" | "expression";
    headers: Array<{
      id: string;
      name: string;
      value: string;
      valueType: "fixed" | "expression";
    }>;
    sendBody: boolean;
    bodyMode: "fields" | "json";
    bodySpecifierType: "fixed" | "expression";
    bodyJson: string;
    bodyJsonType: "fixed" | "expression";
    bodyFields: Array<{
      id: string;
      name: string;
      value: string;
      valueType: "fixed" | "expression";
    }>;
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
  });
  const [leftPaneWidth, setLeftPaneWidth] = React.useState(0.3);
  const [centerPaneWidth, setCenterPaneWidth] = React.useState(0.4);
  const [isResizing, setIsResizing] = React.useState<"left" | "right" | null>(null);
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
  );
  const edgeTypes = React.useMemo(() => ({ [EDGE_TYPE]: ButtonEdge }), []);
  const displayEdges = React.useMemo(
    () =>
      edges.map((edge) => {
        const targetStatus = nodeStatuses[edge.target];
        const statusStroke =
          targetStatus === "success"
            ? "#10b981"
            : targetStatus === "error"
              ? "#ef4444"
              : targetStatus === "loading"
                ? "#2a43e9"
                : "#8b8b8b";

        return {
          ...edge,
          style: {
            ...(edge.style ?? {}),
            stroke: statusStroke,
            strokeWidth: targetStatus && targetStatus !== "initial" ? 2 : 1.5,
          },
        };
      }),
    [edges, nodeStatuses]
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const hasManualTrigger = React.useMemo(
    () => nodes.some((n) => n.type === "manualTrigger"),
    [nodes]
  );
  const hasAnyTrigger = React.useMemo(
    () =>
      nodes.some(
        (n) =>
          n.type === "manualTrigger" ||
          n.type === "webhookTrigger" ||
          n.type === "scheduleTrigger"
      ),
    [nodes]
  );

  const onConnect = React.useCallback((params: Connection) => {
    setEdges((snapshot) =>
      addEdge(
        {
          ...params,
          type: EDGE_TYPE,
          style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
        },
        snapshot
      )
    );
  }, [setEdges]);

  React.useEffect(() => {
    setEdges((current) => {
      let changed = false;
      const normalized = current.map((edge) => {
        const needsType = edge.type !== EDGE_TYPE;
        const needsStyle = edge.style?.stroke !== "#8b8b8b" || edge.style?.strokeWidth !== 1.5;
        if (!needsType && !needsStyle) return edge;
        changed = true;
        return {
          ...edge,
          type: EDGE_TYPE,
          style: {
            ...(edge.style ?? {}),
            stroke: "#8b8b8b",
            strokeWidth: 1.5,
          },
        };
      });
      return changed ? normalized : current;
    });
  }, [setEdges]);

  React.useEffect(() => {
    onWorkflowChange?.({ nodes, edges });
  }, [nodes, edges, onWorkflowChange]);

  const addNodeFromSelector = React.useCallback(
    (selection: (typeof nodeOptions)[number]) => {
      if (selection.type === "manual-trigger" && hasManualTrigger) {
        setSelectorOpen(false);
        setPendingEdgeInsert(null);
        return;
      }

      const isExecutionType =
        selection.type === "http-request" ||
        selection.type === "gemini-execution" ||
        selection.type === "chatgpt-execution" ||
        selection.type === "anthropic-execution" ||
        selection.type === "tavily-execution";

      if (isExecutionType && !hasAnyTrigger) {
        setSelectorOpen(false);
        setPendingEdgeInsert(null);
        return;
      }

      const newNodeId = `node-${Date.now()}-${nodes.length + 1}`;

      setNodes((currentNodes: Node[]) => {
        const existingInitial = currentNodes.find((node) => node.type === "initialPlus");
        const sourceNode = pendingSourceNodeId
          ? currentNodes.find((node) => node.id === pendingSourceNodeId)
          : null;
        const insertSourceNode = pendingEdgeInsert
          ? currentNodes.find((node) => node.id === pendingEdgeInsert.source)
          : null;
        const insertTargetNode = pendingEdgeInsert
          ? currentNodes.find((node) => node.id === pendingEdgeInsert.target)
          : null;
        const nextIndex = currentNodes.length + 1;
        const y = 120 + (nextIndex % 5) * 120;
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
                  x: (insertSourceNode.position.x + insertTargetNode.position.x) / 2,
                  y: (insertSourceNode.position.y + insertTargetNode.position.y) / 2,
                }
            : existingInitial
              ? existingInitial.position
            : {
                x: 220 + nextIndex * 40,
                y,
              },
          data: { label: selection.label },
        };

        if (existingInitial) {
          return currentNodes
            .filter((node) => node.id !== existingInitial.id)
            .concat(newNode);
        }

        return [...currentNodes, newNode];
      });

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
        );
      }
      if (pendingEdgeInsert) {
        setEdges((snapshot) => {
          const withoutOriginal = snapshot.filter((edge) => edge.id !== pendingEdgeInsert.edgeId);
          const withSourceToNew = addEdge(
            {
              id: `e-${pendingEdgeInsert.source}-${newNodeId}`,
              source: pendingEdgeInsert.source,
              target: newNodeId,
              type: EDGE_TYPE,
              style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
            },
            withoutOriginal
          );

          return addEdge(
            {
              id: `e-${newNodeId}-${pendingEdgeInsert.target}`,
              source: newNodeId,
              target: pendingEdgeInsert.target,
              type: EDGE_TYPE,
              style: { stroke: "#8b8b8b", strokeWidth: 1.5 },
            },
            withSourceToNew
          );
        });
      }

      setPendingSourceNodeId(null);
      setPendingEdgeInsert(null);
      setSelectorMode("all");
      setSelectorOpen(false);
    },
    [hasAnyTrigger, nodes, pendingEdgeInsert, pendingSourceNodeId, setEdges, setNodes]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTriggerNodeOptions = triggerNodeOptions.filter((option) =>
    `${option.label} ${option.description}`.toLowerCase().includes(normalizedQuery)
  );
  const filteredExecutionNodeOptions = executionNodeOptions.filter((option) =>
    `${option.label} ${option.description}`.toLowerCase().includes(normalizedQuery)
  );
  const parsedOutput = React.useMemo(() => {
    const raw = nodeEditor.outputSample?.trim();
    if (!raw) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }, [nodeEditor.outputSample]);
  const prettyJsonOutput = React.useMemo(() => {
    if (parsedOutput !== null) {
      return JSON.stringify(parsedOutput, null, 2);
    }
    return nodeEditor.outputSample || "";
  }, [nodeEditor.outputSample, parsedOutput]);
  const hasAnyOutput = React.useMemo(
    () => (nodeEditor.outputSample?.trim()?.length ?? 0) > 0,
    [nodeEditor.outputSample]
  );
  const previousNode = React.useMemo(() => {
    if (!nodeEditor.nodeId) return null;
    const incomingEdge = edges.find((edge) => edge.target === nodeEditor.nodeId);
    if (!incomingEdge?.source) return null;
    return nodes.find((node) => node.id === incomingEdge.source) ?? null;
  }, [edges, nodeEditor.nodeId, nodes]);
  const previousNodeData = (previousNode?.data ?? {}) as WorkflowNodeData;
  const previousNodeOutput = previousNodeData.outputSample ?? "";
  const parsedPreviousOutput = React.useMemo(() => {
    const raw = previousNodeOutput.trim();
    if (!raw) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }, [previousNodeOutput]);
  const prettyPreviousJsonOutput = React.useMemo(() => {
    if (parsedPreviousOutput !== null) {
      return JSON.stringify(parsedPreviousOutput, null, 2);
    }
    return previousNodeOutput;
  }, [parsedPreviousOutput, previousNodeOutput]);
  const hasPreviousOutput = React.useMemo(
    () => previousNodeOutput.trim().length > 0,
    [previousNodeOutput]
  );
  const expressionFieldPaths = React.useMemo(
    () => getExpressionPaths(parsedPreviousOutput),
    [parsedPreviousOutput]
  );

  const executeWorkflowNow = async (targetNodeId?: string) => {
    const unconfiguredNodes = getUnconfiguredNodes(nodes);
    if (unconfiguredNodes.length > 0) {
      const count = unconfiguredNodes.length;
      toast.error(
        count === 1
          ? "1 node is not configured properly."
          : `${count} nodes are not configured properly.`,
        {
          description: "Please configure required fields before executing the workflow.",
        }
      );
      return;
    }

    setIsExecuting(true);
    const now = new Date().toLocaleTimeString();
    setLastExecutedAt(now);
    setExecutionStatuses([]);
    const initialStatuses: Record<string, NodeRunStatus> = {};
    for (const node of nodes) {
      initialStatuses[node.id] = "initial";
    }
    const manualNode = nodes.find((n) => n.type === "manualTrigger");
    if (manualNode) {
      initialStatuses[manualNode.id] = "loading";
    }
    setNodeStatuses(initialStatuses);
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
                : "initial";
        const streamedStatuses: Array<{
          nodeId: string;
          label: string;
          status: "running" | "success" | "error" | "skipped";
          message?: string;
          statusCode?: number;
          output?: string;
        }> = [];
        const result = await onExecuteWorkflow((status) => {
          streamedStatuses.push(status);
          setExecutionStatuses([...streamedStatuses]);

          setNodeStatuses((current) => {
            const next = { ...current };
            if (status.status === "running") {
              for (const nodeId of Object.keys(next)) {
                if (next[nodeId] === "loading" && nodeId !== status.nodeId) {
                  next[nodeId] = "success";
                }
              }
            }
            next[status.nodeId] = toNodeRunStatus(status.status);
            return next;
          });

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
            );
            setNodeEditor((currentEditor) =>
              currentEditor.nodeId === status.nodeId
                ? {
                    ...currentEditor,
                    outputSample: status.output ?? "",
                  }
                : currentEditor
            );
          }
        }, targetNodeId ? { targetNodeId } : undefined);
        const finalStatuses = result?.statuses?.length
          ? result.statuses
          : streamedStatuses;
        setExecutionStatuses(finalStatuses);
        if (finalStatuses.length) {
          const mapped: Record<string, NodeRunStatus> = { ...initialStatuses };

          for (const item of finalStatuses) {
            mapped[item.nodeId] = toNodeRunStatus(item.status);
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
              );
              setNodeEditor((currentEditor) =>
                currentEditor.nodeId === item.nodeId
                  ? {
                      ...currentEditor,
                      outputSample: item.output ?? "",
                    }
                  : currentEditor
              );
            }
          }
          setNodeStatuses(mapped);
        } else {
          setNodeStatuses(() => {
            const fallbackStatuses = { ...initialStatuses };
            if (manualNode) {
              fallbackStatuses[manualNode.id] = "error";
            }
            return fallbackStatuses;
          });
          if (manualNode) {
            setExecutionStatuses([
              {
                nodeId: manualNode.id,
                label: (manualNode.data as WorkflowNodeData)?.label || "Manual Trigger",
                status: "error",
                message: "Execution stream ended before node updates were received.",
              },
            ]);
          }
        }
      } else {
        setExecutionStatuses([
          {
            nodeId: "manual",
            label: "Manual Trigger",
            status: "success",
            message: "Executed locally",
          },
        ]);
        if (manualNode) {
          setNodeStatuses({
            ...initialStatuses,
            [manualNode.id]: "success",
          });
        } else {
          setNodeStatuses(initialStatuses);
        }
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <SelectorContext.Provider
      value={{
        openSelector: (sourceNodeId?: string, mode: "all" | "executions" = "all") => {
          setPendingEdgeInsert(null);
          setPendingSourceNodeId(sourceNodeId ?? null);
          setSelectorMode(mode);
          setSelectorOpen(true);
        },
        openNodeEditor: (nodeId: string, label: string, kind: "Trigger" | "Execution") => {
          const node = nodes.find((item) => item.id === nodeId);
          const data = (node?.data ?? {}) as WorkflowNodeData;
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
            queryParamsMode: data.queryParamsMode === "json" ? "json" : "fields",
            queryParamsSpecifierType:
              data.queryParamsSpecifierType === "expression" ? "expression" : "fixed",
            queryParamsJson: data.queryParamsJson || "",
            queryParamsJsonType: data.queryParamsJsonType === "expression" ? "expression" : "fixed",
            queryParams:
              data.queryParams && data.queryParams.length > 0
                ? data.queryParams.map((item, index) => ({
                    id: item.id || `qp-${Date.now()}-${index}`,
                    name: item.name || "",
                    value: item.value || "",
                    valueType: item.valueType === "expression" ? "expression" : "fixed",
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
            headersSpecifierType: data.headersSpecifierType === "expression" ? "expression" : "fixed",
            headersJson: data.headersJson || "",
            headersJsonType: data.headersJsonType === "expression" ? "expression" : "fixed",
            headers:
              data.headers && data.headers.length > 0
                ? data.headers.map((item, index) => ({
                    id: item.id || `hdr-${Date.now()}-${index}`,
                    name: item.name || "",
                    value: item.value || "",
                    valueType: item.valueType === "expression" ? "expression" : "fixed",
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
            bodySpecifierType: data.bodySpecifierType === "expression" ? "expression" : "fixed",
            bodyJson: data.bodyJson || "",
            bodyJsonType: data.bodyJsonType === "expression" ? "expression" : "fixed",
            bodyFields:
              data.bodyFields && data.bodyFields.length > 0
                ? data.bodyFields.map((item, index) => ({
                    id: item.id || `body-${Date.now()}-${index}`,
                    name: item.name || "",
                    value: item.value || "",
                    valueType: item.valueType === "expression" ? "expression" : "fixed",
                  }))
                : [
                    {
                      id: `body-${Date.now()}`,
                      name: "",
                      value: "",
                      valueType: "fixed",
                    },
                  ],
          });
        },
        getNodeStatus: (nodeId: string) => nodeStatuses[nodeId] ?? "initial",
        connectingFromNodeId,
      }}
    >
      <EdgeActionsContext.Provider
        value={{
          onEdgeInsert: (edgeId, source, target) => {
            setPendingSourceNodeId(null);
            setPendingEdgeInsert({ edgeId, source, target });
            setSelectorMode("executions");
            setSelectorOpen(true);
          },
          onEdgeDelete: (edgeId) => {
            setEdges((snapshot) => snapshot.filter((edge) => edge.id !== edgeId));
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
              setConnectingFromNodeId(params.nodeId);
              return;
            }
            setConnectingFromNodeId(null);
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
                className="bg-background text-foreground border-border shadow-sm"
                onClick={() => {
                  if (selectorOpen && selectorMode === "all" && !pendingSourceNodeId) {
                    setSelectorOpen(false);
                    setPendingEdgeInsert(null);
                    return;
                  }
                  setPendingSourceNodeId(null);
                  setPendingEdgeInsert(null);
                  setSelectorMode("all");
                  setSelectorOpen(true);
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
                setSelectorOpen(false);
                setPendingEdgeInsert(null);
              }}
            />
            <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto border-l border-border bg-background text-foreground shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="font-semibold">
                  {selectorMode === "executions" ? "Add execution step" : "What triggers this workflow?"}
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
                  setSelectorOpen(false);
                  setPendingEdgeInsert(null);
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
                  <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">Triggers</p>
                  {filteredTriggerNodeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => addNodeFromSelector(option)}
                        className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                      >
                        <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </button>
                    );
                  })}
                  <Separator />
                </>
              )}

              {(selectorMode === "executions" || hasAnyTrigger) && (
                <p className="px-3 pb-1 pt-1 text-xs font-medium text-muted-foreground">Executions</p>
              )}
              {(selectorMode === "executions" || hasAnyTrigger) && filteredExecutionNodeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => addNodeFromSelector(option)}
                    className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                  >
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </button>
                );
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
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>Docs</span>
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </button>
                  <Separator orientation="vertical" className="h-5" />
                  <button
                    type="button"
                    onClick={() =>
                      setNodeEditor((current) => ({ ...current, isOpen: false }))
                    }
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
                    if (!isResizing) return;
                    const container = event.currentTarget.getBoundingClientRect();
                    const x = event.clientX - container.left;
                    if (isResizing === "left") {
                      const nextLeft = Math.min(Math.max(x / container.width, 0.2), 0.6);
                      const rightWidth = 1 - leftPaneWidth - centerPaneWidth;
                      const maxLeft = 0.8 - rightWidth;
                      setLeftPaneWidth(Math.min(nextLeft, maxLeft));
                      return;
                    }
                    const leftAndCenter = x / container.width;
                    const nextCenter = leftAndCenter - leftPaneWidth;
                    const clampedCenter = Math.min(Math.max(nextCenter, 0.2), 0.6);
                    const maxCenter = 0.8 - leftPaneWidth;
                    setCenterPaneWidth(Math.min(clampedCenter, maxCenter));
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
                    <div className="border-r border-border p-4">
                      <p className="mb-3 text-xs font-semibold text-muted-foreground">Input</p>
                      {previousNode ? (
                        <div className="h-[calc(100%-22px)]">
                          <InputTabsPanel
                            parsedInput={parsedPreviousOutput}
                            prettyJsonInput={prettyPreviousJsonOutput}
                            hasInput={hasPreviousOutput}
                            isExecuting={isExecuting}
                            previousNodeType={previousNode.type}
                            onExecutePreviousStep={() => executeWorkflowNow(previousNode.id)}
                          />
                        </div>
                      ) : (
                        <div className="flex h-[calc(100%-22px)] items-center justify-center rounded-md border border-border bg-card p-3 text-center text-xs text-muted-foreground">
                          No previous node connected to provide input.
                        </div>
                      )}
                    </div>

                    <div
                      className="cursor-col-resize bg-border/60 hover:bg-primary/40 transition-colors"
                      onMouseDown={() => setIsResizing("left")}
                    />

                    <div className="border-r border-border p-4">
                      <p className="mb-3 text-xs font-semibold text-muted-foreground">Configuration</p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-foreground">Method</label>
                          <Select
                            value={nodeEditor.method}
                            onValueChange={(value) => {
                              setNodeEditor((current) => ({ ...current, method: value }));
                              if (!nodeEditor.nodeId) return;
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
                              );
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
                              const nextValue = event.target.value;
                              setNodeEditor((current) => ({ ...current, url: nextValue }));
                              if (!nodeEditor.nodeId) return;
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
                              );
                            }}
                            placeholder="https://api.example.com/resource"
                          />
                        </div>
                        <div className="rounded-md border border-border bg-card p-3">
                          <p className="mb-2 text-xs font-medium text-foreground">Input Fields (drag for expression)</p>
                          {expressionFieldPaths.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {expressionFieldPaths.map((path) => (
                                <button
                                  key={path}
                                  type="button"
                                  draggable
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData("text/plain", path);
                                  }}
                                  className="rounded border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                                  title={`{{ $json.${path} }}`}
                                >
                                  {path}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">
                              No previous-node fields available yet. Run previous step first.
                            </p>
                          )}
                        </div>
                        <div className="rounded-md border border-border bg-card p-3">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={nodeEditor.sendQueryParams}
                                onCheckedChange={(checked) => {
                                  setNodeEditor((current) => ({ ...current, sendQueryParams: checked }));
                                  if (!nodeEditor.nodeId) return;
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
                                  );
                                }}
                              />
                              <span className="text-sm font-medium text-foreground">Send Query Parameters</span>
                            </div>
                          </div>

                          {nodeEditor.sendQueryParams && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-medium text-foreground">Specify Query Parameters</label>
                                  <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNodeEditor((current) => ({ ...current, queryParamsSpecifierType: "fixed" }));
                                        if (!nodeEditor.nodeId) return;
                                        setNodes((currentNodes) =>
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
                                        );
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
                                        setNodeEditor((current) => ({ ...current, queryParamsSpecifierType: "expression" }));
                                        if (!nodeEditor.nodeId) return;
                                        setNodes((currentNodes) =>
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
                                        );
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
                                    setNodeEditor((current) => ({ ...current, queryParamsMode: value }));
                                    if (!nodeEditor.nodeId) return;
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
                                    );
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
                                    <label className="text-xs font-medium text-foreground">JSON</label>
                                    <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNodeEditor((current) => ({ ...current, queryParamsJsonType: "fixed" }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
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
                                          );
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
                                          setNodeEditor((current) => ({ ...current, queryParamsJsonType: "expression" }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
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
                                          );
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
                                      const nextValue = event.target.value;
                                      setNodeEditor((current) => ({ ...current, queryParamsJson: nextValue }));
                                      if (!nodeEditor.nodeId) return;
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
                                      );
                                    }}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      const path = event.dataTransfer.getData("text/plain");
                                      if (!path) return;
                                      const nextValue = appendExpression(nodeEditor.queryParamsJson, path);
                                      setNodeEditor((current) => ({ ...current, queryParamsJson: nextValue }));
                                      if (!nodeEditor.nodeId) return;
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
                                      );
                                    }}
                                    placeholder={`{\n  "page": "1",\n  "limit": "10"\n}`}
                                    className="h-24 w-full resize-none rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-foreground">Query Parameters</p>
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
                                        ];
                                        setNodeEditor((current) => ({ ...current, queryParams: nextParams }));
                                        if (!nodeEditor.nodeId) return;
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
                                        );
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
                                                  {param.name?.trim() ? param.name : `Query Parameter ${index + 1}`}
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                aria-label="Delete query parameter"
                                                className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/param:opacity-100"
                                                onMouseDown={(event) => {
                                                  event.preventDefault();
                                                  event.stopPropagation();
                                                }}
                                                onClick={(event) => {
                                                  event.preventDefault();
                                                  event.stopPropagation();
                                                  const nextParams = nodeEditor.queryParams.filter(
                                                    (item) => item.id !== param.id
                                                  );
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
                                                        ];
                                                  setNodeEditor((current) => ({
                                                    ...current,
                                                    queryParams: normalizedParams,
                                                  }));
                                                  if (!nodeEditor.nodeId) return;
                                                  setNodes((currentNodes) =>
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
                                                  );
                                                }}
                                              >
                                                <Trash2Icon className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <div className="space-y-3">
                                              <div className="space-y-1">
                                                <label className="text-xs font-medium text-foreground">Name</label>
                                                <Input
                                                  value={param.name}
                                                  onChange={(event) => {
                                                    const nextParams = nodeEditor.queryParams.map((item) =>
                                                      item.id === param.id ? { ...item, name: event.target.value } : item
                                                    );
                                                    setNodeEditor((current) => ({ ...current, queryParams: nextParams }));
                                                    if (!nodeEditor.nodeId) return;
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
                                                    );
                                                  }}
                                                  onDragOver={(event) => event.preventDefault()}
                                                  onDrop={(event) => {
                                                    event.preventDefault();
                                                    const path = event.dataTransfer.getData("text/plain");
                                                    if (!path) return;
                                                    const nextParams = nodeEditor.queryParams.map((item) =>
                                                      item.id === param.id
                                                        ? { ...item, name: appendExpression(item.name, path) }
                                                        : item
                                                    );
                                                    setNodeEditor((current) => ({ ...current, queryParams: nextParams }));
                                                    if (!nodeEditor.nodeId) return;
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
                                                    );
                                                  }}
                                                  className="h-8 text-xs"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                  <label className="text-xs font-medium text-foreground">Value</label>
                                                  <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const nextParams = nodeEditor.queryParams.map((item) =>
                                                          item.id === param.id ? { ...item, valueType: "fixed" as const } : item
                                                        );
                                                        setNodeEditor((current) => ({ ...current, queryParams: nextParams }));
                                                        if (!nodeEditor.nodeId) return;
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
                                                        );
                                                      }}
                                                      className={`rounded px-2 py-0.5 ${
                                                        (param.valueType ?? "fixed") === "fixed"
                                                          ? "bg-background text-foreground"
                                                          : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      Fixed
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const nextParams = nodeEditor.queryParams.map((item) =>
                                                          item.id === param.id ? { ...item, valueType: "expression" as const } : item
                                                        );
                                                        setNodeEditor((current) => ({ ...current, queryParams: nextParams }));
                                                        if (!nodeEditor.nodeId) return;
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
                                                        );
                                                      }}
                                                      className={`rounded px-2 py-0.5 ${
                                                        (param.valueType ?? "fixed") === "expression"
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
                                                    const nextParams = nodeEditor.queryParams.map((item) =>
                                                      item.id === param.id ? { ...item, value: event.target.value } : item
                                                    );
                                                    setNodeEditor((current) => ({ ...current, queryParams: nextParams }));
                                                    if (!nodeEditor.nodeId) return;
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
                                                    );
                                                  }}
                                                  onDragOver={(event) => event.preventDefault()}
                                                  onDrop={(event) => {
                                                    event.preventDefault();
                                                    const path = event.dataTransfer.getData("text/plain");
                                                    if (!path) return;
                                                    const nextParams = nodeEditor.queryParams.map((item) =>
                                                      item.id === param.id
                                                        ? { ...item, value: appendExpression(item.value, path) }
                                                        : item
                                                    );
                                                    setNodeEditor((current) => ({ ...current, queryParams: nextParams }));
                                                    if (!nodeEditor.nodeId) return;
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
                                                    );
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
                                setNodeEditor((current) => ({ ...current, sendHeaders: checked }));
                                if (!nodeEditor.nodeId) return;
                                setNodes((currentNodes) =>
                                  currentNodes.map((node) =>
                                    node.id === nodeEditor.nodeId
                                      ? {
                                          ...node,
                                          data: { ...(node.data as WorkflowNodeData), sendHeaders: checked },
                                        }
                                      : node
                                  )
                                );
                              }}
                            />
                            <span className="text-sm font-medium text-foreground">Send Headers</span>
                          </div>
                          {nodeEditor.sendHeaders && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-end">
                                <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNodeEditor((current) => ({ ...current, headersSpecifierType: "fixed" }));
                                      if (!nodeEditor.nodeId) return;
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? { ...node, data: { ...(node.data as WorkflowNodeData), headersSpecifierType: "fixed" } }
                                            : node
                                        )
                                      );
                                    }}
                                    className={`rounded px-2 py-0.5 ${nodeEditor.headersSpecifierType === "fixed" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                                  >
                                    Fixed
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNodeEditor((current) => ({ ...current, headersSpecifierType: "expression" }));
                                      if (!nodeEditor.nodeId) return;
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? { ...node, data: { ...(node.data as WorkflowNodeData), headersSpecifierType: "expression" } }
                                            : node
                                        )
                                      );
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
                                  setNodeEditor((current) => ({ ...current, headersMode: value }));
                                  if (!nodeEditor.nodeId) return;
                                  setNodes((currentNodes) =>
                                    currentNodes.map((node) =>
                                      node.id === nodeEditor.nodeId
                                        ? { ...node, data: { ...(node.data as WorkflowNodeData), headersMode: value } }
                                        : node
                                    )
                                  );
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
                                    const nextValue = event.target.value;
                                    setNodeEditor((current) => ({ ...current, headersJson: nextValue }));
                                    if (!nodeEditor.nodeId) return;
                                    setNodes((currentNodes) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? { ...node, data: { ...(node.data as WorkflowNodeData), headersJson: nextValue } }
                                          : node
                                      )
                                    );
                                  }}
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={(event) => {
                                    event.preventDefault();
                                    const path = event.dataTransfer.getData("text/plain");
                                    if (!path) return;
                                    const nextValue = appendExpression(nodeEditor.headersJson, path);
                                    setNodeEditor((current) => ({ ...current, headersJson: nextValue }));
                                    if (!nodeEditor.nodeId) return;
                                    setNodes((currentNodes) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? { ...node, data: { ...(node.data as WorkflowNodeData), headersJson: nextValue } }
                                          : node
                                      )
                                    );
                                  }}
                                  className="h-24 w-full resize-none rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground"
                                />
                              ) : (
                                <div className="space-y-2">
                                  {nodeEditor.headers.map((header, index) => (
                                    <div key={header.id} className="rounded-md border border-border p-2">
                                      <p className="mb-1 text-xs text-muted-foreground">{header.name || `Header ${index + 1}`}</p>
                                      <Input
                                        value={header.name}
                                        onChange={(event) => {
                                          const nextHeaders = nodeEditor.headers.map((item) =>
                                            item.id === header.id ? { ...item, name: event.target.value } : item
                                          );
                                          setNodeEditor((current) => ({ ...current, headers: nextHeaders }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? { ...node, data: { ...(node.data as WorkflowNodeData), headers: nextHeaders } }
                                                : node
                                            )
                                          );
                                        }}
                                        placeholder="Name"
                                        className="mb-1 h-8 text-xs"
                                      />
                                      <Input
                                        value={header.value}
                                        onChange={(event) => {
                                          const nextHeaders = nodeEditor.headers.map((item) =>
                                            item.id === header.id ? { ...item, value: event.target.value } : item
                                          );
                                          setNodeEditor((current) => ({ ...current, headers: nextHeaders }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? { ...node, data: { ...(node.data as WorkflowNodeData), headers: nextHeaders } }
                                                : node
                                            )
                                          );
                                        }}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={(event) => {
                                          event.preventDefault();
                                          const path = event.dataTransfer.getData("text/plain");
                                          if (!path) return;
                                          const nextHeaders = nodeEditor.headers.map((item) =>
                                            item.id === header.id ? { ...item, value: appendExpression(item.value, path) } : item
                                          );
                                          setNodeEditor((current) => ({ ...current, headers: nextHeaders }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? { ...node, data: { ...(node.data as WorkflowNodeData), headers: nextHeaders } }
                                                : node
                                            )
                                          );
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
                                      const nextHeaders = [...nodeEditor.headers, { id: `hdr-${Date.now()}`, name: "", value: "", valueType: "fixed" }];
                                      setNodeEditor((current) => ({ ...current, headers: nextHeaders }));
                                      if (!nodeEditor.nodeId) return;
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? { ...node, data: { ...(node.data as WorkflowNodeData), headers: nextHeaders } }
                                            : node
                                        )
                                      );
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
                                setNodeEditor((current) => ({ ...current, sendBody: checked }));
                                if (!nodeEditor.nodeId) return;
                                setNodes((currentNodes) =>
                                  currentNodes.map((node) =>
                                    node.id === nodeEditor.nodeId
                                      ? { ...node, data: { ...(node.data as WorkflowNodeData), sendBody: checked } }
                                      : node
                                  )
                                );
                              }}
                            />
                            <span className="text-sm font-medium text-foreground">Send Body</span>
                          </div>
                          {nodeEditor.sendBody && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-end">
                                <div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNodeEditor((current) => ({ ...current, bodySpecifierType: "fixed" }));
                                      if (!nodeEditor.nodeId) return;
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? { ...node, data: { ...(node.data as WorkflowNodeData), bodySpecifierType: "fixed" } }
                                            : node
                                        )
                                      );
                                    }}
                                    className={`rounded px-2 py-0.5 ${nodeEditor.bodySpecifierType === "fixed" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                                  >
                                    Fixed
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNodeEditor((current) => ({ ...current, bodySpecifierType: "expression" }));
                                      if (!nodeEditor.nodeId) return;
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? { ...node, data: { ...(node.data as WorkflowNodeData), bodySpecifierType: "expression" } }
                                            : node
                                        )
                                      );
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
                                  setNodeEditor((current) => ({ ...current, bodyMode: value }));
                                  if (!nodeEditor.nodeId) return;
                                  setNodes((currentNodes) =>
                                    currentNodes.map((node) =>
                                      node.id === nodeEditor.nodeId
                                        ? { ...node, data: { ...(node.data as WorkflowNodeData), bodyMode: value } }
                                        : node
                                    )
                                  );
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
                                    const nextValue = event.target.value;
                                    setNodeEditor((current) => ({ ...current, bodyJson: nextValue }));
                                    if (!nodeEditor.nodeId) return;
                                    setNodes((currentNodes) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? { ...node, data: { ...(node.data as WorkflowNodeData), bodyJson: nextValue } }
                                          : node
                                      )
                                    );
                                  }}
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={(event) => {
                                    event.preventDefault();
                                    const path = event.dataTransfer.getData("text/plain");
                                    if (!path) return;
                                    const nextValue = appendExpression(nodeEditor.bodyJson, path);
                                    setNodeEditor((current) => ({ ...current, bodyJson: nextValue }));
                                    if (!nodeEditor.nodeId) return;
                                    setNodes((currentNodes) =>
                                      currentNodes.map((node) =>
                                        node.id === nodeEditor.nodeId
                                          ? { ...node, data: { ...(node.data as WorkflowNodeData), bodyJson: nextValue } }
                                          : node
                                      )
                                    );
                                  }}
                                  className="h-24 w-full resize-none rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground"
                                />
                              ) : (
                                <div className="space-y-2">
                                  {nodeEditor.bodyFields.map((field, index) => (
                                    <div key={field.id} className="rounded-md border border-border p-2">
                                      <p className="mb-1 text-xs text-muted-foreground">{field.name || `Body Field ${index + 1}`}</p>
                                      <Input
                                        value={field.name}
                                        onChange={(event) => {
                                          const nextFields = nodeEditor.bodyFields.map((item) =>
                                            item.id === field.id ? { ...item, name: event.target.value } : item
                                          );
                                          setNodeEditor((current) => ({ ...current, bodyFields: nextFields }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? { ...node, data: { ...(node.data as WorkflowNodeData), bodyFields: nextFields } }
                                                : node
                                            )
                                          );
                                        }}
                                        placeholder="Name"
                                        className="mb-1 h-8 text-xs"
                                      />
                                      <Input
                                        value={field.value}
                                        onChange={(event) => {
                                          const nextFields = nodeEditor.bodyFields.map((item) =>
                                            item.id === field.id ? { ...item, value: event.target.value } : item
                                          );
                                          setNodeEditor((current) => ({ ...current, bodyFields: nextFields }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? { ...node, data: { ...(node.data as WorkflowNodeData), bodyFields: nextFields } }
                                                : node
                                            )
                                          );
                                        }}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={(event) => {
                                          event.preventDefault();
                                          const path = event.dataTransfer.getData("text/plain");
                                          if (!path) return;
                                          const nextFields = nodeEditor.bodyFields.map((item) =>
                                            item.id === field.id ? { ...item, value: appendExpression(item.value, path) } : item
                                          );
                                          setNodeEditor((current) => ({ ...current, bodyFields: nextFields }));
                                          if (!nodeEditor.nodeId) return;
                                          setNodes((currentNodes) =>
                                            currentNodes.map((node) =>
                                              node.id === nodeEditor.nodeId
                                                ? { ...node, data: { ...(node.data as WorkflowNodeData), bodyFields: nextFields } }
                                                : node
                                            )
                                          );
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
                                      const nextFields = [...nodeEditor.bodyFields, { id: `body-${Date.now()}`, name: "", value: "", valueType: "fixed" }];
                                      setNodeEditor((current) => ({ ...current, bodyFields: nextFields }));
                                      if (!nodeEditor.nodeId) return;
                                      setNodes((currentNodes) =>
                                        currentNodes.map((node) =>
                                          node.id === nodeEditor.nodeId
                                            ? { ...node, data: { ...(node.data as WorkflowNodeData), bodyFields: nextFields } }
                                            : node
                                        )
                                      );
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
                      className="cursor-col-resize bg-border/60 hover:bg-primary/40 transition-colors"
                      onMouseDown={() => setIsResizing("right")}
                    />

                    <div className="min-w-0 overflow-hidden p-4">
                      <div className="h-[calc(100%-22px)]">
                        <OutputTabsPanel
                          parsedOutput={parsedOutput}
                          prettyJsonOutput={prettyJsonOutput}
                          hasOutput={hasAnyOutput}
                          isExecuting={isExecuting}
                          onExecuteStep={() => executeWorkflowNow(nodeEditor.nodeId ?? undefined)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Node title</label>
                    <Input
                      value={nodeEditor.value}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setNodeEditor((current) => ({ ...current, value: nextValue }));
                        if (!nodeEditor.nodeId) return;
                        setNodes((currentNodes) =>
                          currentNodes.map((node) =>
                            node.id === nodeEditor.nodeId
                              ? {
                                  ...node,
                                  data: {
                                    ...(node.data as WorkflowNodeData),
                                    label: nextValue.trim() || "Untitled Node",
                                  },
                                }
                              : node
                          )
                        );
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
  );
}
