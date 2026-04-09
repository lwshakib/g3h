"use client";

import { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
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
import type { HttpRequestNodeData } from "@/features/executions/node-data-types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  initialData?: HttpRequestNodeData;
}

export function HttpRequestDialog({
  open,
  onOpenChange,
  nodeId,
  initialData,
}: Props) {
  const { setNodes } = useReactFlow();
  const [method, setMethod] = useState<HttpRequestNodeData["method"]>("GET");
  const [endpoint, setEndpoint] = useState("");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState("");
  const [variableName, setVariableName] = useState("");

  // Initialize form with node data when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setMethod(initialData.method || "GET");
        setEndpoint(initialData.endpoint || "");
        setBody(
          typeof initialData.body === "string"
            ? initialData.body
            : initialData.body
            ? JSON.stringify(initialData.body, null, 2)
            : ""
        );
        setHeaders(
          typeof initialData.headers === "string"
            ? initialData.headers
            : initialData.headers
            ? JSON.stringify(initialData.headers, null, 2)
            : ""
        );
        setVariableName(initialData.variableName || "");
      } else {
        // Reset to defaults when no initial data
        setMethod("GET");
        setEndpoint("");
        setBody("");
        setHeaders("");
        setVariableName("");
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedData: HttpRequestNodeData = {
            ...(node.data as HttpRequestNodeData),
            method,
            endpoint,
            body:
              method && ["POST", "PUT", "PATCH"].includes(method)
                ? body
                : undefined,
            headers: headers.trim() || undefined,
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
      setMethod(initialData.method || "GET");
      setEndpoint(initialData.endpoint || "");
      setBody(
        typeof initialData.body === "string"
          ? initialData.body
          : initialData.body
          ? JSON.stringify(initialData.body, null, 2)
          : ""
      );
      setHeaders(
        typeof initialData.headers === "string"
          ? initialData.headers
          : initialData.headers
          ? JSON.stringify(initialData.headers, null, 2)
          : ""
      );
      setVariableName(initialData.variableName || "");
    }
    onOpenChange(false);
  };

  const methodsRequireBody =
    method && ["POST", "PUT", "PATCH"].includes(method);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>
            Configure the HTTP request settings for this node.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="method">Method</Label>
            <Select
              value={method}
              onValueChange={(value) =>
                setMethod(value as HttpRequestNodeData["method"])
              }
            >
              <SelectTrigger id="method" className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input
              id="endpoint"
              placeholder="https://api.example.com/endpoint or /todos/{{users[0].id}}"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
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
              placeholder="users (optional - auto-generated if not set)"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Name to store this response (e.g., "users"). Other nodes can
              reference it using {"{{users[0].id}}"} for arrays or{" "}
              {"{{todos.title}}"} for objects
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="headers">Headers</Label>
            <Textarea
              id="headers"
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter headers as JSON object (e.g., {"{"}"Authorization": "Bearer
              token"{"}"}).
            </p>
          </div>

          {methodsRequireBody && (
            <div className="grid gap-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the request body as JSON or plain text.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!endpoint.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
