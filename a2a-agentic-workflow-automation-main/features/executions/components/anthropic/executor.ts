import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import type { AnthropicNodeData } from "@/features/executions/node-data-types";
import {
  replaceVariables,
} from "@/features/executions/lib/variable-parser";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { getCredentialById } from "@/actions/credential";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const anthropicExecutor: NodeExecutor<AnthropicNodeData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
  userId,
}) => {
  console.log(
    `[Anthropic] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  if (!data.prompt) {
    if (publish) {
      try {
        await publish(
          anthropicChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Anthropic] Published error status (no prompt) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Anthropic] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Prompt is required");
  }

  if (!data.credentialId?.trim()) {
    if (publish) {
      try {
        await publish(
          anthropicChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Anthropic] Published error status (no credential) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Anthropic] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Credential is required");
  }

  // Replace variables in prompt
  const originalPrompt =
    typeof data.prompt === "string" ? data.prompt : String(data.prompt);
  const prompt = replaceVariables(originalPrompt, context);

  // Log if replacement occurred (for debugging)
  if (originalPrompt !== prompt) {
    console.log(`Variable replacement: "${originalPrompt}" -> "${prompt}"`);
  } else if (originalPrompt.includes("{{")) {
    console.warn(`No variables replaced in prompt: "${originalPrompt}"`, {
      contextKeys: Object.keys(context),
    });
  }

  const result = await step.run("anthropic-request", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          anthropicChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(`[Anthropic] Published loading status for node: ${nodeId}`);
      } catch (error) {
        console.error(`[Anthropic] Failed to publish loading status:`, error);
      }
    }

    try {
      // Get model name from data or use default
      const modelName = data.model?.trim() || "claude-3-5-sonnet-20241022";

      // Fetch credential by ID
      if (!userId) {
        throw new NonRetriableError("User context is required for credential lookup");
      }
      
      const credentialResult = await getCredentialById(data.credentialId!, userId);
      if (!credentialResult.success || !credentialResult.credential) {
        throw new NonRetriableError("Credential not found or access denied");
      }

      const apiKey = credentialResult.credential.apiKey;

      // Create model instance with the specified model name and API key
      const anthropic = createAnthropic({
        apiKey,
      });
      const model = anthropic(modelName);

      const { text } = await generateText({
        model,
        prompt,
      });

      // Determine variable name (use provided or default)
      const variableName =
        data.variableName?.trim() || "anthropic";

      // Store data directly in context for simple variable access
      const updatedContext = {
        ...context,
        [variableName]: text,
      };

      // Publish success state
      if (publish) {
        try {
          await publish(
            anthropicChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(
            `[Anthropic] Published success status for node: ${nodeId}`
          );
        } catch (error) {
          console.error(
            `[Anthropic] Failed to publish success status:`,
            error
          );
        }
      }

      return updatedContext;
    } catch (error) {
      // Publish error state
      if (publish) {
        try {
          await publish(
            anthropicChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(`[Anthropic] Published error status for node: ${nodeId}`);
        } catch (publishError) {
          console.error(
            `[Anthropic] Failed to publish error status:`,
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

