"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { WorkflowType, useWorkflowStore } from "@/context";
import { Node, Edge } from "@xyflow/react";
import { NodeComponents } from "@/components/react-flow/node-components";
import { AddNodeButton } from "@/components/react-flow/add-node-button";
import { NodeType } from "@/generated/prisma/enums";
import { ExecuteWorkflowButton } from "@/components/execute-workflow-button";
import { toast } from "sonner";

export default function Editor({ workflow }: { workflow: WorkflowType }) {
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);
  const [isSaving, setIsSaving] = useState(false);
  const { theme } = useTheme();
  const { setEditorNodes, setEditorEdges } = useWorkflowStore();

  // Sync initial nodes and edges with store when workflow changes
  useEffect(() => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setEditorNodes(workflow.nodes);
    setEditorEdges(workflow.edges);
  }, [workflow.id, setEditorNodes, setEditorEdges]);

  // Sync nodes and edges with store whenever they change
  useEffect(() => {
    setEditorNodes(nodes);
  }, [nodes, setEditorNodes]);

  useEffect(() => {
    setEditorEdges(edges);
  }, [edges, setEditorEdges]);

  // Save workflow function
  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workflows/${workflow.id}/nodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes,
          edges,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save workflow");
      }

      toast.success("Workflow saved successfully");
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save workflow"
      );
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, workflow.id, isSaving]);

  // Keyboard shortcut handler (Ctrl+S or Cmd+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nodesSnapshot) => {
      const updated = applyNodeChanges(changes, nodesSnapshot);
      return updated;
    });
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((edgesSnapshot) => {
      const updated = applyEdgeChanges(changes, edgesSnapshot);
      return updated;
    });
  }, []);
  const onConnect = useCallback((params: Connection) => {
    setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
  }, []);

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        colorMode={theme as "light" | "dark" | undefined}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NodeComponents}
        fitView
        // snapGrid={[10,10]}
        // snapToGrid
        // panOnScroll
        panOnDrag={false}
        selectionOnDrag
        proOptions={{
          hideAttribution: true,
        }}
      >
        <MiniMap />
        <Background />
        <Controls />
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflow.id} />
          </Panel>
        )}
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
      </ReactFlow>
    </div>
  );
}
