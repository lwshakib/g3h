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
  CalendarClockIcon,
  EllipsisIcon,
  GlobeIcon,
  MousePointerIcon,
  PlayIcon,
  PlusIcon,
  PowerIcon,
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

type WorkflowEditorProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
};

type WorkflowNodeData = {
  label: string;
};

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
  setEdges: ReturnType<typeof useReactFlow>["setEdges"]
) {
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

  setEdges((currentEdges: Edge[]) =>
    currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
  );
}

const SelectorContext = React.createContext<{
  openSelector: (sourceNodeId?: string, mode?: "all" | "executions") => void;
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
      <BaseEdge id={id} path={edgePath} />
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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <WebhookIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />
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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <CalendarClockIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />
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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <GlobeIcon className="size-11 text-[#8a8a8a] stroke-[1.8]" />

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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <GeminiLogoIcon className="h-11 w-11" />
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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <OpenAiLogoIcon className="h-11 w-11" />
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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <AnthropicLogoIcon className="h-11 w-11" />
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
  const { setNodes, setEdges } = useReactFlow();
  const ctx = React.useContext(SelectorContext);
  const isConnectingFromThisNode = ctx?.connectingFromNodeId === id;
  const edges = useStore((state) => state.edges);
  const hasOutgoingConnection = React.useMemo(
    () => edges.some((edge) => edge.source === id),
    [edges, id]
  );
  const showAddAffordance = !isConnectingFromThisNode && !hasOutgoingConnection;

  return (
    <div className="group/node relative w-[244px]">
      <NodeTopToolbar onDelete={() => deleteNodeAndConnections(id, setNodes, setEdges)} />
      <div className="flex items-center justify-center">
        <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#3a3a3a] bg-[#1f1f1f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <TavilyLogoIcon className="h-11 w-11" />
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
  const [connectingFromNodeId, setConnectingFromNodeId] = React.useState<string | null>(null);
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

  return (
    <SelectorContext.Provider
      value={{
        openSelector: (sourceNodeId?: string, mode: "all" | "executions" = "all") => {
          setPendingEdgeInsert(null);
          setPendingSourceNodeId(sourceNodeId ?? null);
          setSelectorMode(mode);
          setSelectorOpen(true);
        },
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
          edges={edges}
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
          <MiniMap />
          <Background />
          <Controls />
          {!nodes.some((n) => n.type === "initialPlus") && (
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
        </div>
      </EdgeActionsContext.Provider>
    </SelectorContext.Provider>
  );
}
