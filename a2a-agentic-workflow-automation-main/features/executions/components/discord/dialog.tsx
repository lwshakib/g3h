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
import type { DiscordNodeData } from "@/features/executions/node-data-types";
import { NodeType } from "@/generated/prisma/enums";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  initialData?: DiscordNodeData;
}

type Credential = {
  id: string;
  name: string;
  description: string | null;
  nodeType: NodeType;
};

export function DiscordDialog({
  open,
  onOpenChange,
  nodeId,
  initialData,
}: Props) {
  const { setNodes } = useReactFlow();
  const [credentialId, setCredentialId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [message, setMessage] = useState("");
  const [variableName, setVariableName] = useState("");
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  // Fetch credentials when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingCredentials(true);
      fetch(`/api/credentials?nodeType=${NodeType.DISCORD}`)
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
        setChannelId(initialData.channelId || "");
        setMessage(initialData.message || "");
        setVariableName(initialData.variableName || "");
      } else {
        // Reset to defaults when no initial data
        setCredentialId("");
        setChannelId("");
        setMessage("");
        setVariableName("");
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedData: DiscordNodeData = {
            ...(node.data as DiscordNodeData),
            credentialId: credentialId.trim() || undefined,
            channelId: channelId.trim() || undefined,
            message: message.trim() || undefined,
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
      setChannelId(initialData.channelId || "");
      setMessage(initialData.message || "");
      setVariableName(initialData.variableName || "");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Discord</DialogTitle>
          <DialogDescription>
            Send a message to a Discord channel using a bot.
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
                        <Image src="/logos/discord.svg" alt="Discord" width={16} height={16} className="shrink-0" />
                        <span>{cred.name}</span>
                        {cred.description && <span className="text-muted-foreground">- {cred.description}</span>}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a credential with your Discord bot token.{" "}
              <Link href="/credentials" className="text-primary underline">
                Manage credentials
              </Link>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="channelId">Channel ID *</Label>
            <Input
              id="channelId"
              placeholder="123456789012345678"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The Discord channel ID where the message will be sent. Enable Developer Mode in Discord to copy channel IDs.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter your message. Use {{variableName.path}} to reference previous responses."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
              placeholder="discordResponse (optional - auto-generated if not set)"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Name to store this response (e.g., "discordResponse"). Other nodes
              can reference it using {"{{discordResponse}}"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!credentialId.trim() || !channelId.trim() || !message.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

