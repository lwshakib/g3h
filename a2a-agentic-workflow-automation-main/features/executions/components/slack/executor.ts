import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import type { SlackNodeData } from "@/features/executions/node-data-types";
import {
  replaceVariables,
} from "@/features/executions/lib/variable-parser";
import { slackChannel } from "@/inngest/channels/slack";
import { getCredentialById } from "@/actions/credential";

export const slackExecutor: NodeExecutor<SlackNodeData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
  userId,
}) => {
  console.log(
    `[Slack] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  if (!data.credentialId?.trim()) {
    if (publish) {
      try {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Slack] Published error status (no credential) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Slack] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Credential is required");
  }

  if (!data.message?.trim()) {
    if (publish) {
      try {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Slack] Published error status (no message) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Slack] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Message is required");
  }

  // Replace variables in message and channel
  const originalMessage =
    typeof data.message === "string" ? data.message : String(data.message);
  const message = replaceVariables(originalMessage, context);

  const channel = data.channel
    ? replaceVariables(String(data.channel), context)
    : undefined;

  const result = await step.run("slack-request", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          slackChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(`[Slack] Published loading status for node: ${nodeId}`);
      } catch (error) {
        console.error(`[Slack] Failed to publish loading status:`, error);
      }
    }

    try {
      // Fetch credential by ID
      if (!userId) {
        throw new NonRetriableError("User context is required for credential lookup");
      }

      const credentialResult = await getCredentialById(data.credentialId!, userId);
      if (!credentialResult.success || !credentialResult.credential) {
        throw new NonRetriableError("Credential not found or access denied");
      }

      const webhookUrlOrToken = credentialResult.credential.apiKey;

      // Check if credential is a webhook URL or bot token
      let response;
      if (webhookUrlOrToken.startsWith("https://hooks.slack.com/")) {
        // Webhook URL
        response = await fetch(webhookUrlOrToken, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: message,
            channel: channel,
          }),
        });
      } else {
        // Bot token - use Slack Web API
        const payload: { text: string; channel?: string } = { text: message };
        if (channel) {
          payload.channel = channel;
        }

        response = await fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${webhookUrlOrToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Slack API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      // Check for Slack API errors (Slack returns 200 even on errors)
      if (responseData.ok === false) {
        throw new Error(`Slack API error: ${responseData.error || "Unknown error"}`);
      }

      // Determine variable name (use provided or default)
      const variableName =
        data.variableName?.trim() || "slack";

      // Store data directly in context for simple variable access
      const updatedContext = {
        ...context,
        [variableName]: responseData,
      };

      // Publish success state
      if (publish) {
        try {
          await publish(
            slackChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(`[Slack] Published success status for node: ${nodeId}`);
        } catch (error) {
          console.error(`[Slack] Failed to publish success status:`, error);
        }
      }

      return updatedContext;
    } catch (error) {
      // Publish error state
      if (publish) {
        try {
          await publish(
            slackChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(`[Slack] Published error status for node: ${nodeId}`);
        } catch (publishError) {
          console.error(
            `[Slack] Failed to publish error status:`,
            publishError
          );
        }
      }
      // Re-throw the error so Inngest can handle it
      throw error;
    }
  });

  return result;
};

