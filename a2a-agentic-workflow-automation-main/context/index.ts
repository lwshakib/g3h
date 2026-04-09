import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";

export interface WorkflowType {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  nodes: Node[];
  edges: Edge[];
}

interface WorkflowStore {
  workflows: WorkflowType[];
  setWorkflows: (workflows: WorkflowType[]) => void;
  currentWorkflow: WorkflowType | null;
  setCurrentWorkflow: (currentWorkflow: WorkflowType | null) => void;
  editorNodes: Node[];
  editorEdges: Edge[];
  setEditorNodes: (nodes: Node[]) => void;
  setEditorEdges: (edges: Edge[]) => void;
  executionTrigger: number;
  resetNodeStatuses: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: [],
  setWorkflows: (workflows) => set({ workflows }),
  currentWorkflow: null,
  setCurrentWorkflow: (currentWorkflow) => set({ currentWorkflow }),
  editorNodes: [],
  editorEdges: [],
  setEditorNodes: (nodes) => set({ editorNodes: nodes }),
  setEditorEdges: (edges) => set({ editorEdges: edges }),
  executionTrigger: 0,
  resetNodeStatuses: () => set((state) => ({ executionTrigger: state.executionTrigger + 1 })),
}));
