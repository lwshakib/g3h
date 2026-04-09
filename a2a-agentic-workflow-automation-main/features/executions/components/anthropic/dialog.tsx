"use client";

import { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnthropicNodeData } from "@/features/executions/node-data-types";
import { NodeType } from "@/generated/prisma/enums";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  initialData?: AnthropicNodeData;
}

const ANTHROPIC_MODELS = [
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
  { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
] as const;

type Credential = {
  id: string;
  name: string;
  description: string | null;
  nodeType: NodeType;
};

export function AnthropicDialog({
  open,
  onOpenChange,
  nodeId,
  initialData,
}: Props) {
  const { setNodes } = useReactFlow();
  const [prompt, setPrompt] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [model, setModel] = useState("claude-3-5-sonnet-20241022");
  const [variableName, setVariableName] = useState("");
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  // Fetch credentials when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingCredentials(true);
      fetch(`/api/credentials?nodeType=${NodeType.ANTHROPIC}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.credentials) {
            setCredentials(data.credentials);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch credentials:", error);
        })
        .finally(() => {
          setLoadingCredentials(false);
        });
    }
  }, [open]);

  // Initialize form with node data when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setPrompt(initialData.prompt || "");
        setCredentialId(initialData.credentialId || "");
        setModel(initialData.model || "claude-3-5-sonnet-20241022");
        setVariableName(initialData.variableName || "");
      } else {
        // Reset to defaults when no initial data
        setPrompt("");
        setCredentialId("");
        setModel("claude-3-5-sonnet-20241022");
        setVariableName("");
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedData: AnthropicNodeData = {
            ...(node.data as AnthropicNodeData),
            prompt,
            credentialId: credentialId.trim() || undefined,
            model: model.trim() || undefined,
            variableName: variableName.trim() || undefined,
          };
          return {
            ...node,
            data: updatedData,
          };
        }
        return node;
      })
    );
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form to initial data
    if (initialData) {
      setPrompt(initialData.prompt || "");
      setCredentialId(initialData.credentialId || "");
      setModel(initialData.model || "claude-3-5-sonnet-20241022");
      setVariableName(initialData.variableName || "");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Anthropic (Claude)</DialogTitle>
          <DialogDescription>
            Configure the Anthropic Claude AI prompt for this node.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="credential">Credential *</Label>
            <Select
              value={credentialId}
              onValueChange={setCredentialId}
              disabled={loadingCredentials}
            >
              <SelectTrigger id="credential" className="w-full">
                <SelectValue placeholder={loadingCredentials ? "Loading..." : "Select a credential"} />
              </SelectTrigger>
              <SelectContent>
                {credentials.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No credentials found.{" "}
                    <Link href="/credentials" className="text-primary underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  credentials.map((cred) => (
                    <SelectItem key={cred.id} value={cred.id}>
                      <div className="flex items-center gap-2">
                        <Image src="/logos/anthropic.svg" alt="Anthropic" width={16} height={16} className="shrink-0" />
                        <span>{cred.name}</span>
                        {cred.description && <span className="text-muted-foreground">- {cred.description}</span>}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a credential to use for this node.{" "}
              <Link href="/credentials" className="text-primary underline">
                Manage credentials
              </Link>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model" className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {ANTHROPIC_MODELS.map((modelOption) => (
                  <SelectItem key={modelOption.value} value={modelOption.value}>
                    {modelOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the Claude model to use for this request
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your prompt here. Use {{variableName.path}} to reference previous responses."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{variableName.path}}"} to reference previous responses. For
              arrays, use {"{{users[0].id}}"} or {"{{users[0].name}}"}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="variableName">Variable Name</Label>
            <Input
              id="variableName"
              placeholder="claudeResponse (optional - auto-generated if not set)"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Name to store this response (e.g., "claudeResponse"). Other nodes
              can reference it using {"{{claudeResponse}}"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!prompt.trim() || !credentialId.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
