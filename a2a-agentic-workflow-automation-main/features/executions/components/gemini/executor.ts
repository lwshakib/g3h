import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import type { GeminiNodeData } from "@/features/executions/node-data-types";
import {
  replaceVariables,
} from "@/features/executions/lib/variable-parser";
import { geminiChannel } from "@/inngest/channels/gemini";
import { getCredentialById } from "@/actions/credential";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const geminiExecutor: NodeExecutor<GeminiNodeData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
  userId
}) => {
  console.log(
    `[Gemini] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  if (!data.prompt) {
    if (publish) {
      try {
        await publish(
          geminiChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Gemini] Published error status (no prompt) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Gemini] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Prompt is required");
  }

  if (!data.credentialId?.trim()) {
    if (publish) {
      try {
        await publish(
          geminiChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Gemini] Published error status (no credential) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Gemini] Failed to publish error status:`, error);
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

  const result = await step.run("gemini-request", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          geminiChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(`[Gemini] Published loading status for node: ${nodeId}`);
      } catch (error) {
        console.error(`[Gemini] Failed to publish loading status:`, error);
      }
    }

    try {
      // Get model name from data or use default
      const modelName = data.model?.trim() || "gemini-2.5-flash";

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
      const gemini = createGoogleGenerativeAI({
        apiKey,
      });
      const model = gemini(modelName);

      const { text } = await generateText({
        model,
        prompt,
      });

      // Determine variable name (use provided or default)
      const variableName =
        data.variableName?.trim() || "gemini";

      // Store data directly in context for simple variable access
      const updatedContext = {
        ...context,
        [variableName]: text,
      };

      // Publish success state
      if (publish) {
        try {
          await publish(
            geminiChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(`[Gemini] Published success status for node: ${nodeId}`);
        } catch (error) {
          console.error(`[Gemini] Failed to publish success status:`, error);
        }
      }

      return updatedContext;
    } catch (error) {
      // Publish error state
      if (publish) {
        try {
          await publish(
            geminiChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(`[Gemini] Published error status for node: ${nodeId}`);
        } catch (publishError) {
          console.error(
            `[Gemini] Failed to publish error status:`,
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
