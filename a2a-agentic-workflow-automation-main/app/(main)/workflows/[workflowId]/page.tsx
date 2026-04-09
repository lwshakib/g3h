"use client";
import React, { useState, useEffect } from "react";
import { WorkflowLoader } from "@/components/workflow-loader";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkflowStore } from "@/context";
import Editor from "@/features/editor/Editor";



export default function page() {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentWorkflow, currentWorkflow } = useWorkflowStore();

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.workflow) {
            // Save to store
            setCurrentWorkflow(data.workflow);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch workflow");
          setCurrentWorkflow(null);
        }
      } catch (err) {
        console.error("Error fetching workflow:", err);
        setError("Failed to fetch workflow");
        setCurrentWorkflow(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId, setCurrentWorkflow]);

  return (
    <>
      <WorkflowLoader workflowId={workflowId} />
      <div className="w-full h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : currentWorkflow ? (
          <div className="w-full h-full">
            <Editor workflow={currentWorkflow} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Workflow not found</p>
          </div>
        )}
      </div>
    </>
  );
}
