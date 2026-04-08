"use client";

import * as React from "react";
import {
  addEdge,
  Background,
  ConnectionLineType,
  Controls,
  Handle,
  MiniMap,
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
import { GlobeIcon, MousePointerIcon, PlusIcon, Settings2Icon, WandSparklesIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";

type WorkflowEditorProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
};

type WorkflowNodeData = {
  label: string;
};

const SelectorContext = React.createContext<{
  openSelector: () => void;
  isConnecting: boolean;
} | null>(null);

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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnecting = Boolean(ctx?.isConnecting);
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );

  return (
    <div className="relative w-[244px]">
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <MousePointerIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />

          {/* Visible connection source exactly on border center */}
          <Handle
            type="source"
            position={Position.Right}
            className="!pointer-events-auto !z-[60] !h-[18px] !w-[18px] !border-[#4a4a4a] !bg-[#202020] !shadow-none"
          />

          {/* Add-step affordance hidden once already connected */}
          {!hasOutgoingConnection && (
            <>
              <div className="pointer-events-none absolute right-[-50px] top-1/2 h-px w-[34px] -translate-y-1/2 bg-[#4a4a4a]" />
              {!isConnecting && (
                <button
                  type="button"
                  onClick={() => ctx?.openSelector()}
                  className="pointer-events-auto absolute right-[-76px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-[6px] border border-[#3f3f3f] bg-[#292929] text-[#9a9a9a] hover:text-white"
                >
                  <PlusIcon className="size-3.5 stroke-[2.4]" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {!isConnecting && (
        <p className="mt-[16px] text-center text-[24px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground">
          When clicking &lsquo;Execute workflow&rsquo;
        </p>
      )}

    </div>
  );
}

function HttpRequestNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const [method, setMethod] = React.useState("GET");
  const [url, setUrl] = React.useState("https://api.example.com");
  const [status, setStatus] = React.useState<string | null>(null);
  const { setNodes, setEdges } = useReactFlow();

  const simulateRequest = () => {
    setStatus(`Simulated ${method} request to ${url}`);
  };

  return (
    <div className="w-80 rounded-md border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <GlobeIcon className="size-4 text-primary" />
          <p className="text-sm font-semibold">{data.label}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setNodes((nodes) => nodes.filter((n) => n.id !== id));
            setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
          }}
        >
          <Settings2Icon className="size-4" />
        </Button>
      </div>
      <div className="space-y-2 border-t px-3 py-3">
        <p className="text-xs text-muted-foreground">Configure request (UI only)</p>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 text-xs"
          placeholder="https://api.example.com"
        />
        <Button size="sm" variant="secondary" className="w-full" onClick={simulateRequest}>
          Send test request
        </Button>
      </div>
      {status && <p className="px-3 pb-2 text-xs text-muted-foreground">{status}</p>}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
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
] as const;

const triggerNodeOptions = nodeOptions.filter((option) => option.type === "manual-trigger");
const executionNodeOptions = nodeOptions.filter((option) => option.type === "http-request");

export function WorkflowEditor({
  initialNodes = defaultInitialNodes,
  initialEdges = defaultInitialEdges,
}: WorkflowEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const colorMode = mounted
    ? (resolvedTheme === "dark" ? "dark" : "light")
    : undefined;
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [lastExecutedAt, setLastExecutedAt] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const nodeTypes = React.useMemo(
    () => ({
      initialPlus: InitialPlusNode,
      manualTrigger: ManualTriggerNode,
      httpRequest: HttpRequestNode,
    }),
    []
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const hasManualTrigger = React.useMemo(
    () => nodes.some((n) => n.type === "manualTrigger"),
    [nodes]
  );

  const onConnect = React.useCallback((params: Connection) => {
    setEdges((snapshot) =>
      addEdge(
        {
          ...params,
          type: "default",
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
        const needsType = edge.type !== "default";
        const needsStyle = edge.style?.stroke !== "#8b8b8b" || edge.style?.strokeWidth !== 1.5;
        if (!needsType && !needsStyle) return edge;
        changed = true;
        return {
          ...edge,
          type: "default",
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

  const addNodeFromSelector = React.useCallback(
    (selection: (typeof nodeOptions)[number]) => {
      if (selection.type === "manual-trigger" && hasManualTrigger) {
        setSelectorOpen(false);
        return;
      }

      if (selection.type === "http-request" && !hasManualTrigger) {
        setSelectorOpen(false);
        return;
      }

      setNodes((currentNodes: Node[]) => {
        const existingInitial = currentNodes.find((node) => node.type === "initialPlus");
        const nextIndex = currentNodes.length + 1;
        const y = 120 + (nextIndex % 5) * 120;
        const newNode: Node = {
          id: `node-${Date.now()}-${nextIndex}`,
          type: selection.type === "manual-trigger" ? "manualTrigger" : "httpRequest",
          position: existingInitial
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
      setSelectorOpen(false);
    },
    [hasManualTrigger, nodes, setNodes]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTriggerNodeOptions = triggerNodeOptions.filter((option) =>
    `${option.label} ${option.description}`.toLowerCase().includes(normalizedQuery)
  );
  const filteredExecutionNodeOptions = executionNodeOptions.filter((option) =>
    `${option.label} ${option.description}`.toLowerCase().includes(normalizedQuery)
  );

  return (
    <SelectorContext.Provider
      value={{
        openSelector: () => setSelectorOpen(true),
        isConnecting,
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <ReactFlow
          key={colorMode ?? "pending-theme"}
          colorMode={colorMode}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionLineType={ConnectionLineType.Bezier}
          onConnectStart={() => setIsConnecting(true)}
          onConnectEnd={() => setIsConnecting(false)}
          nodeTypes={nodeTypes}
          panOnDrag={false}
          selectionOnDrag
          proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        fitViewOptions={{ maxZoom: 0.75 }}
          fitView
        >
          <MiniMap />
          <Background />
          <Controls />
          {!nodes.some((n) => n.type === "initialPlus") && (
            <Panel position="top-right">
              <Button
                size="icon"
                variant="outline"
                className="bg-background text-foreground border-border shadow-sm"
                onClick={() => setSelectorOpen((open) => !open)}
              >
                <PlusIcon />
              </Button>
            </Panel>
          )}
          {hasManualTrigger && (
            <Panel position="bottom-center">
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={() => setLastExecutedAt(new Date().toLocaleTimeString())}
                >
                  Execute workflow
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
          <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto border-l border-border bg-background text-foreground shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="font-semibold">What triggers this workflow?</h3>
                <p className="text-sm text-muted-foreground">
                  A trigger is a step that starts your workflow.
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setSelectorOpen(false)}
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
              {hasManualTrigger && (
                <>
                  <Separator />
                  <p className="px-3 pb-1 pt-1 text-xs font-medium text-muted-foreground">Executions</p>
                </>
              )}
              {hasManualTrigger && filteredExecutionNodeOptions.map((option) => {
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
        )}
      </div>
    </SelectorContext.Provider>
  );
}
