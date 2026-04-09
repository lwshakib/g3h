import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import type { DiscordNodeData } from "@/features/executions/node-data-types";
import {
  replaceVariables,
} from "@/features/executions/lib/variable-parser";
import { discordChannel } from "@/inngest/channels/discord";
import { getCredentialById } from "@/actions/credential";

export const discordExecutor: NodeExecutor<DiscordNodeData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
  userId,
}) => {
  console.log(
    `[Discord] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  if (!data.credentialId?.trim()) {
    if (publish) {
      try {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Discord] Published error status (no credential) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Discord] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Credential is required");
  }

  if (!data.channelId?.trim()) {
    if (publish) {
      try {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Discord] Published error status (no channel ID) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Discord] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Channel ID is required");
  }

  if (!data.message?.trim()) {
    if (publish) {
      try {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Discord] Published error status (no message) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Discord] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Message is required");
  }

  // Replace variables in message and channel ID
  const originalMessage =
    typeof data.message === "string" ? data.message : String(data.message);
  const message = replaceVariables(originalMessage, context);

  const originalChannelId =
    typeof data.channelId === "string" ? data.channelId : String(data.channelId);
  const channelId = replaceVariables(originalChannelId, context);

  const result = await step.run("discord-request", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          discordChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(`[Discord] Published loading status for node: ${nodeId}`);
      } catch (error) {
        console.error(`[Discord] Failed to publish loading status:`, error);
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

      const botToken = credentialResult.credential.apiKey;

      // Send message to Discord channel
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      // Determine variable name (use provided or default)
      const variableName =
        data.variableName?.trim() || "discord";

      // Store data directly in context for simple variable access
      const updatedContext = {
        ...context,
        [variableName]: responseData,
      };

      // Publish success state
      if (publish) {
        try {
          await publish(
            discordChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(`[Discord] Published success status for node: ${nodeId}`);
        } catch (error) {
          console.error(`[Discord] Failed to publish success status:`, error);
        }
      }

      return updatedContext;
    } catch (error) {
      // Publish error state
      if (publish) {
        try {
          await publish(
            discordChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(`[Discord] Published error status for node: ${nodeId}`);
        } catch (publishError) {
          console.error(
            `[Discord] Failed to publish error status:`,
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

