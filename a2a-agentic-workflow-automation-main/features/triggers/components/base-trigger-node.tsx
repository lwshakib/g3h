"use client";

import { memo, type ReactNode } from "react";
import type { NodeProps } from "@xyflow/react";
import { Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

import { WorkflowNode } from "@/components/react-flow/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(function BaseTriggerNode(
  props: BaseTriggerNodeProps
) {
  const {
    icon: Icon,
    name,
    description,
    children,
    status,
    onSettings,
    onDoubleClick,
  } = props;
  const {setNodes, setEdges} = useReactFlow();


  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
    setEdges((edges) => edges.filter((edge) => edge.source !== props.id));
    console.log("delete");
  };  

  return (
    <WorkflowNode
      name={name}
      description={description}
      onSettings={onSettings}
      onDelete={handleDelete}
    >
      <NodeStatusIndicator 
      status={status}
      variant="border"
      className="rounded-l-2xl"
      >
      <BaseNode
        onDoubleClick={onDoubleClick}
        className="rounded-l-2xl relative group"
        status={status}
      >
        <BaseNodeContent>
          {typeof Icon === "string" ? (
            <Image src={Icon} alt={name} width={16} height={16} />
          ) : (
            <Icon className="h-5 w-5" />
          )}

          {children}
        </BaseNodeContent>

        <BaseHandle id="source-1" type="source" position={Position.Right} />
      </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
});

BaseTriggerNode.displayName = "BaseTriggerNode";
