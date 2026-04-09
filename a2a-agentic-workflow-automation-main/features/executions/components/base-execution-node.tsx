"use client";

import { memo, type ReactNode } from "react";
import type { NodeProps } from "@xyflow/react";
import { Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

import { WorkflowNode } from "@/components/react-flow/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { useReactFlow } from "@xyflow/react";
import { NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(function BaseExecutionNode(
  props: BaseExecutionNodeProps
) {
  const {
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    status = "initial",
    onDoubleClick,
  } = props;

  const { setNodes, setEdges } = useReactFlow();

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
      <NodeStatusIndicator status={status} variant="border" >
      <BaseNode onDoubleClick={onDoubleClick} status={status}>
        <BaseNodeContent>
          {typeof Icon === "string" ? (
            <Image src={Icon} alt={name} width={24} height={24} />
          ) : (
            <Icon className="h-5 w-5" />
          )}

          {children}
        </BaseNodeContent>

        <BaseHandle id="target-1" type="target" position={Position.Left} />
        <BaseHandle id="source-1" type="source" position={Position.Right} />
      </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
});

BaseExecutionNode.displayName = "BaseExecutionNode";
