"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreVertical, Loader2, KeyIcon, GlobeIcon } from "lucide-react";
import { toast } from "sonner";
import { NodeType } from "@/generated/prisma/enums";
import Image from "next/image";
import {
  getCredentials,
  createCredential,
  updateCredential,
  deleteCredential,
} from "@/actions/credential";

type Credential = {
  id: string;
  name: string;
  description: string | null;
  nodeType: NodeType;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.GEMINI]: "Gemini",
  [NodeType.ANTHROPIC]: "Anthropic",
  [NodeType.OPENAI]: "OpenAI",
  [NodeType.DISCORD]: "Discord",
  [NodeType.SLACK]: "Slack",
  [NodeType.TAVILY]: "Tavily",
  [NodeType.INITIAL]: "Initial",
  [NodeType.MANUAL_TRIGGER]: "Manual Trigger",
  [NodeType.HTTP_REQUEST]: "HTTP Request",
  [NodeType.GOOGLE_FROM_TRIGGER]: "Google Form Trigger",
  [NodeType.STRIPE_TRIGGER]: "Stripe Trigger",
};

const AI_NODE_TYPES = [NodeType.GEMINI, NodeType.ANTHROPIC, NodeType.OPENAI];
const MESSAGING_NODE_TYPES = [NodeType.DISCORD, NodeType.SLACK];
const SEARCH_NODE_TYPES = [NodeType.TAVILY];

// Helper function to render node type icon
const renderNodeTypeIcon = (nodeType: NodeType) => {
  switch (nodeType) {
    case NodeType.GEMINI:
      return <Image src="/logos/gemini.svg" alt="Gemini" width={20} height={20} className="shrink-0" />;
    case NodeType.ANTHROPIC:
      return <Image src="/logos/anthropic.svg" alt="Anthropic" width={20} height={20} className="shrink-0" />;
    case NodeType.OPENAI:
      return <Image src="/logos/openai.svg" alt="OpenAI" width={20} height={20} className="shrink-0" />;
    case NodeType.DISCORD:
      return <Image src="/logos/discord.svg" alt="Discord" width={20} height={20} className="shrink-0" />;
    case NodeType.SLACK:
      return <Image src="/logos/slack.svg" alt="Slack" width={20} height={20} className="shrink-0" />;
    case NodeType.TAVILY:
      return <Image src="/logos/tavily.svg" alt="Tavily" width={20} height={20} className="shrink-0" />;
    case NodeType.HTTP_REQUEST:
      return <GlobeIcon className="h-5 w-5 shrink-0" />;
    case NodeType.GOOGLE_FROM_TRIGGER:
      return <Image src="/logos/google-form.svg" alt="Google Form" width={20} height={20} className="shrink-0" />;
    case NodeType.STRIPE_TRIGGER:
      return <Image src="/logos/stripe.svg" alt="Stripe" width={20} height={20} className="shrink-0" />;
    default:
      return null;
  }
};

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    nodeType: "" as NodeType | "",
    apiKey: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCredentials();
      if (result.success) {
        setCredentials(result.credentials as Credential[]);
      } else {
        toast.error(result.error || "Failed to fetch credentials");
      }
    } catch (error) {
      toast.error("Failed to fetch credentials");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleCreate = () => {
    setFormData({ name: "", description: "", nodeType: "", apiKey: "" });
    setSelectedCredential(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (credential: Credential) => {
    setFormData({
      name: credential.name,
      description: credential.description || "",
      nodeType: credential.nodeType,
      apiKey: "", // Don't show existing API key for security
    });
    setSelectedCredential(credential);
    setIsEditOpen(true);
  };

  const handleDelete = (credential: Credential) => {
    setSelectedCredential(credential);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim() || !formData.nodeType || !formData.apiKey.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCredential({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        nodeType: formData.nodeType as NodeType,
        apiKey: formData.apiKey.trim(),
      });

      if (result.success) {
        toast.success("Credential created successfully");
        setIsCreateOpen(false);
        setFormData({ name: "", description: "", nodeType: "", apiKey: "" });
        fetchCredentials();
      } else {
        toast.error(result.error || "Failed to create credential");
      }
    } catch (error) {
      toast.error("Failed to create credential");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedCredential || !formData.name.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: {
        name?: string;
        description?: string;
        apiKey?: string;
      } = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      // Only update API key if provided
      if (formData.apiKey.trim()) {
        updateData.apiKey = formData.apiKey.trim();
      }

      const result = await updateCredential(selectedCredential.id, updateData);

      if (result.success) {
        toast.success("Credential updated successfully");
        setIsEditOpen(false);
        setFormData({ name: "", description: "", nodeType: "", apiKey: "" });
        setSelectedCredential(null);
        fetchCredentials();
      } else {
        toast.error(result.error || "Failed to update credential");
      }
    } catch (error) {
      toast.error("Failed to update credential");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (!selectedCredential) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCredential(selectedCredential.id);

      if (result.success) {
        toast.success("Credential deleted successfully");
        setIsDeleteOpen(false);
        setSelectedCredential(null);
        fetchCredentials();
      } else {
        toast.error(result.error || "Failed to delete credential");
      }
    } catch (error) {
      toast.error("Failed to delete credential");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credentials</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys and credentials for execution nodes
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Credential
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-12">
              <KeyIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No credentials yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first credential
              </p>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Credential
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Node Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell className="font-medium">{credential.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderNodeTypeIcon(credential.nodeType)}
                        <span>{NODE_TYPE_LABELS[credential.nodeType] || credential.nodeType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {credential.description || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(credential.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(credential)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(credential)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Credential</DialogTitle>
            <DialogDescription>
              Create a new credential for your execution nodes. Select the node type
              and provide your API key.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nodeType">Node Type *</Label>
              <Select
                value={formData.nodeType}
                onValueChange={(value) =>
                  setFormData({ ...formData, nodeType: value as NodeType })
                }
              >
                <SelectTrigger id="nodeType">
                  <SelectValue placeholder="Select a node type" />
                </SelectTrigger>
              <SelectContent>
                {[...AI_NODE_TYPES, ...MESSAGING_NODE_TYPES, ...SEARCH_NODE_TYPES].map((nodeType) => (
                  <SelectItem key={nodeType} value={nodeType}>
                    <div className="flex items-center gap-2">
                      {renderNodeTypeIcon(nodeType)}
                      <span>{NODE_TYPE_LABELS[nodeType]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My Gemini API Key"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                A unique name to identify this credential
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for this credential"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Your API key will be securely stored and encrypted
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Credential</DialogTitle>
            <DialogDescription>
              Update your credential information. Leave API key empty to keep the
              existing one.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-apiKey">API Key</Label>
              <Input
                id="edit-apiKey"
                type="password"
                placeholder="Leave empty to keep existing key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Enter a new API key to update, or leave empty to keep the current one
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credential</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCredential?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
