"use client";
import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { PlaceholderNode } from "@/components/react-flow/placeholders-node";
import { WorkflowNode } from "./workflow-node";
import { NodeSelector } from "./node-selector";

export const InitialNode = memo((props: NodeProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <WorkflowNode>
        <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
        <PlaceholderNode {...props} >
          <div className="flex items-center justify-center cursor-pointer ">
            <PlusIcon className="size-6 text-muted-foreground" />
          </div>
        </PlaceholderNode>
    </NodeSelector>
      </WorkflowNode>
  );
});

InitialNode.displayName = "InitialNode";
