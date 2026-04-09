"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { Copy, Check } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StripeTriggerDialog({ open, onOpenChange }: Props) {
  const { workflowId } = useParams();
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCopiedWebhook(false);
    }
  }, [open]);

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Stripe Webhook</DialogTitle>
          <DialogDescription>
            Configure your Stripe webhook to trigger this workflow when events occur.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyWebhook}
              >
                {copiedWebhook ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this URL and add it as an endpoint in your Stripe Dashboard
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-semibold mb-2">Setup Instructions</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to your Stripe Dashboard</li>
              <li>Navigate to Developers → Webhooks</li>
              <li>Click "Add endpoint"</li>
              <li>Paste the webhook URL above</li>
              <li>Select the events you want to listen to (e.g., payment_intent.succeeded, customer.created)</li>
              <li>Save the endpoint</li>
            </ol>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-semibold mb-2">Available Variables</h4>
            <p className="text-xs text-muted-foreground mb-2">
              When a Stripe event triggers this workflow, the event data will be available as:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code className="bg-background px-1 rounded">{"{{stripeEvent.id}}"}</code> - Event ID</li>
              <li><code className="bg-background px-1 rounded">{"{{stripeEvent.type}}"}</code> - Event type</li>
              <li><code className="bg-background px-1 rounded">{"{{stripeEvent.data}}"}</code> - Event data object</li>
              <li><code className="bg-background px-1 rounded">{"{{stripeEvent.created}}"}</code> - Event timestamp</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

