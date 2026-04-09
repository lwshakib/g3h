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

export const generateGoogleFormScript = (
  webhookUrl: string
) => `function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  // Build responses object
  var responses = {};
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    responses[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  }

  // Prepare webhook payload
  var payload = {
    formId: e.source.getId(),
    formTitle: e.source.getTitle(),
    responseId: formResponse.getId(),
    timestamp: formResponse.getTimestamp(),
    respondentEmail: formResponse.getRespondentEmail(),
    responses: responses
  };

  // Send to webhook
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  // Replace WEBHOOK_URL with your webhook URL from above
  var WEBHOOK_URL = '${webhookUrl}';

  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
  } catch(error) {
    console.error('Webhook failed:', error);
  }
}`;

export function GoogleFormTriggerDialog({ open, onOpenChange }: Props) {
  const { workflowId } = useParams();
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCopiedWebhook(false);
      setCopiedScript(false);
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

  const handleCopyScript = async () => {
    try {
      const script = generateGoogleFormScript(webhookUrl);
      await navigator.clipboard.writeText(script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const appsScript = generateGoogleFormScript(webhookUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form's Apps Script to trigger
            this workflow when a form is submitted.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Webhook URL Section */}
          <div className="grid gap-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyWebhook}
                title="Copy webhook URL"
              >
                {copiedWebhook ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Setup Instructions Section */}
          <div className="grid gap-2">
            <h4 className="text-sm font-semibold">Setup instructions:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Open your Google Form</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Click the three dots menu → Script editor</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Copy and paste the script below</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                <span>Replace WEBHOOK_URL with your webhook URL above</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">5.</span>
                <span>Save and click "Triggers" → Add Trigger</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">6.</span>
                <span>Choose: From form → On form submit → Save</span>
              </li>
            </ol>
          </div>

          {/* Google Apps Script Section */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Google Apps Script:</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyScript}
                className="gap-2"
              >
                {copiedScript ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Google Apps Script
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This script includes your webhook URL and handles form
              submissions.
            </p>
          </div>

          {/* Available Variables Section */}
          <div className="grid gap-2">
            <h4 className="text-sm font-semibold">Available Variables</h4>
            <div className="space-y-1 text-sm">
              <div className="font-mono text-xs bg-muted p-2 rounded">
                {`{{googleForm.respondentEmail}}`}
              </div>
              <p className="text-xs text-muted-foreground">
                - Respondent's email
              </p>
              <div className="font-mono text-xs bg-muted p-2 rounded mt-2">
                {`{{googleForm.responses ['Question Name']}}`}
              </div>
              <p className="text-xs text-muted-foreground">- Specific answer</p>
              <div className="font-mono text-xs bg-muted p-2 rounded mt-2">
                {`{{json googleForm.responses}}`}
              </div>
              <p className="text-xs text-muted-foreground">
                - All responses as JSON
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
