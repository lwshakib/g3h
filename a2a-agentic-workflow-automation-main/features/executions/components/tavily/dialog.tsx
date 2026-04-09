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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TavilyNodeData } from "@/features/executions/node-data-types";
import { NodeType } from "@/generated/prisma/enums";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  initialData?: TavilyNodeData;
}

type Credential = {
  id: string;
  name: string;
  description: string | null;
  nodeType: NodeType;
};

export function TavilyDialog({
  open,
  onOpenChange,
  nodeId,
  initialData,
}: Props) {
  const { setNodes } = useReactFlow();
  const [credentialId, setCredentialId] = useState("");
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState("5");
  const [variableName, setVariableName] = useState("");
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  // Fetch credentials when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingCredentials(true);
      fetch(`/api/credentials?nodeType=${NodeType.TAVILY}`)
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
        setCredentialId(initialData.credentialId || "");
        setQuery(initialData.query || "");
        setMaxResults(String(initialData.maxResults || 5));
        setVariableName(initialData.variableName || "");
      } else {
        // Reset to defaults when no initial data
        setCredentialId("");
        setQuery("");
        setMaxResults("5");
        setVariableName("");
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedData: TavilyNodeData = {
            ...(node.data as TavilyNodeData),
            credentialId: credentialId.trim() || undefined,
            query: query.trim() || undefined,
            maxResults: maxResults ? parseInt(maxResults, 10) : undefined,
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
      setCredentialId(initialData.credentialId || "");
      setQuery(initialData.query || "");
      setMaxResults(String(initialData.maxResults || 5));
      setVariableName(initialData.variableName || "");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tavily Search</DialogTitle>
          <DialogDescription>
            Search the web using Tavily's AI-powered search API.
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
                      {cred.name}
                      {cred.description && <span className="text-muted-foreground"> - {cred.description}</span>}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a credential with your Tavily API key.{" "}
              <Link href="/credentials" className="text-primary underline">
                Manage credentials
              </Link>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="query">Search Query *</Label>
            <Input
              id="query"
              placeholder="Enter your search query. Use {{variableName.path}} to reference previous responses."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{variableName.path}}"} to reference previous responses.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxResults">Max Results</Label>
            <Input
              id="maxResults"
              type="number"
              min="1"
              max="20"
              placeholder="5"
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of search results to return (default: 5, max: 20)
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="variableName">Variable Name</Label>
            <Input
              id="variableName"
              placeholder="tavily (optional - defaults to 'tavily' if not set)"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Name to store this response (e.g., "tavily"). Other nodes
              can reference it using {"{{tavily}}"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!credentialId.trim() || !query.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

