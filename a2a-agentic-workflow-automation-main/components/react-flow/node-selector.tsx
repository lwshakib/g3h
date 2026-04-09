"use client";

import { createId } from "@paralleldrive/cuid2";
import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { NodeType } from "@/generated/prisma/enums";
import { on } from "events";
import { se } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Trigger manually",
    description:
      "Runs the flow on clicking a button. Good for getting started quickly",
    icon: MousePointerIcon,
  },
  {
    type: NodeType.GOOGLE_FROM_TRIGGER,
    label: "Google Form",
    description: "Runs the flow when a Google Form is submitted",
    icon: () => <img src="/logos/google-form.svg" alt="Google Form" className="h-5 w-5 mt-1 shrink-0" />,
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe",
    description: "Runs the flow when a Stripe event occurs",
    icon: () => <img src="/logos/stripe.svg" alt="Stripe" className="h-5 w-5 mt-1 shrink-0" />,
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Makes an HTTP request",
    icon: GlobeIcon,
  },
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Generate text using Google's Gemini AI",
    icon: () => <img src="/logos/gemini.svg" alt="Gemini" className="h-5 w-5 mt-1 shrink-0" />,
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic",
    description: "Generate text using Anthropic's Claude AI",
    icon: () => <img src="/logos/anthropic.svg" alt="Anthropic" className="h-5 w-5 mt-1 shrink-0" />,
  },
  {
    type: NodeType.OPENAI,
    label: "OpenAI",
    description: "Generate text using OpenAI's GPT models",
    icon: () => <img src="/logos/openai.svg" alt="OpenAI" className="h-5 w-5 mt-1 shrink-0" />,
  },
  {
    type: NodeType.DISCORD,
    label: "Discord",
    description: "Send messages to a Discord channel",
    icon: () => <img src="/logos/discord.svg" alt="Discord" className="h-5 w-5 mt-1 shrink-0" />,
  },
  {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send messages to a Slack channel",
    icon: () => <img src="/logos/slack.svg" alt="Slack" className="h-5 w-5 mt-1 shrink-0" />,
  },
  {
    type: NodeType.TAVILY,
    label: "Tavily",
    description: "Search the web using Tavily's AI-powered search",
    icon: () => <img src="/logos/tavily.svg" alt="Tavily" className="h-5 w-5 mt-1 shrink-0" />,
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER
        );
        if (hasManualTrigger) {
          toast.error("Only one manual trigger is allowed");
          return;
        }
      }
      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL
        );
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          type: selection.type,
          position: {
            x: flowPosition.x,
            y: flowPosition.y,
          },
          data: {},
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [setNodes, getNodes, screenToFlowPosition]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {triggerNodes.map((node) => {
            const Icon = node.icon;

            return (
              <button
                key={node.type}
                onClick={() => handleNodeSelect(node)}
                className="flex w-full items-start gap-3 p-3 text-left transition-colors cursor-pointer hover:border-l-primary hover:border-l-solid hover:border-l-2"
              >
                {typeof Icon === "string" ? (
                  <img
                    src={Icon}
                    alt={node.label}
                    className="h-5 w-5 mt-1 shrink-0"
                  />
                ) : (
                  <Icon className="h-5 w-5 mt-1 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{node.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {node.description}
                  </div>
                </div>
              </button>
            );
          })}

          <Separator />

          {executionNodes.map((node) => {
            const Icon = node.icon;

            return (
              <button
                key={node.type}
                onClick={() => handleNodeSelect(node)}
                className="flex w-full items-start gap-3 p-3 text-left transition-colors cursor-pointer hover:border-l-primary hover:border-l-solid hover:border-l-2"
              >
                {typeof Icon === "string" ? (
                  <img
                    src={Icon}
                    alt={node.label}
                    className="h-5 w-5 mt-1 shrink-0"
                  />
                ) : (
                  <Icon className="h-5 w-5 mt-1 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{node.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {node.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
