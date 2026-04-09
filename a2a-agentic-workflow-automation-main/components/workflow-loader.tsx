"use client";

import { useEffect } from "react";
import { useWorkflowStore } from "@/context";

interface WorkflowLoaderProps {
  workflowId: string;
}

export function WorkflowLoader({ workflowId }: WorkflowLoaderProps) {
  const { setCurrentWorkflow } = useWorkflowStore();

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.workflow) {
            setCurrentWorkflow(data.workflow);
          }
        } else {
          console.error("Failed to fetch workflow");
          setCurrentWorkflow(null);
        }
      } catch (error) {
        console.error("Error fetching workflow:", error);
        setCurrentWorkflow(null);
      }
    };

    if (workflowId) {
      fetchWorkflow();
    }

    // Cleanup: clear workflow when component unmounts or workflowId changes
    return () => {
      setCurrentWorkflow(null);
    };
  }, [workflowId, setCurrentWorkflow]);

  return null;
}

