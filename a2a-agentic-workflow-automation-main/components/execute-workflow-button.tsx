"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FlaskConicalIcon, Loader2 } from "lucide-react";
import { useWorkflowStore } from "@/context";
import { toast } from "sonner";

interface ExecuteWorkflowButtonProps {
  workflowId: string;
}

export function ExecuteWorkflowButton({
  workflowId,
}: ExecuteWorkflowButtonProps) {
  const { editorNodes, editorEdges, resetNodeStatuses } = useWorkflowStore();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!workflowId) {
      toast.error("Workflow ID is required");
      return;
    }

    if (editorNodes.length === 0) {
      toast.error("No nodes to execute");
      return;
    }

    // Reset all node statuses to initial before executing
    resetNodeStatuses();

    setIsExecuting(true);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes: editorNodes,
          edges: editorEdges,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute workflow");
      }

      toast.success("Workflow execution started successfully");
    } catch (error) {
      console.error("Error executing workflow:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to execute workflow"
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={isExecuting || !workflowId}
    >
      {isExecuting ? (
        <>
          <Loader2 className="size-4 mr-2 animate-spin" />
          Executing...
        </>
      ) : (
        <>
          <FlaskConicalIcon className="size-4 mr-2" />
          Execute workflow
        </>
      )}
    </Button>
  );
}
