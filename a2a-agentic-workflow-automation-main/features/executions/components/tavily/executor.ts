import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import type { TavilyNodeData } from "@/features/executions/node-data-types";
import {
  replaceVariables,
} from "@/features/executions/lib/variable-parser";
import { tavilyChannel } from "@/inngest/channels/tavily";
import { getCredentialById } from "@/actions/credential";

export const tavilyExecutor: NodeExecutor<TavilyNodeData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
  userId,
}) => {
  console.log(
    `[Tavily] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  if (!data.credentialId?.trim()) {
    if (publish) {
      try {
        await publish(
          tavilyChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Tavily] Published error status (no credential) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Tavily] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Credential is required");
  }

  if (!data.query?.trim()) {
    if (publish) {
      try {
        await publish(
          tavilyChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[Tavily] Published error status (no query) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[Tavily] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Search query is required");
  }

  // Replace variables in query
  const originalQuery =
    typeof data.query === "string" ? data.query : String(data.query);
  const query = replaceVariables(originalQuery, context);

  const maxResults = data.maxResults && data.maxResults > 0 ? data.maxResults : 5;

  const result = await step.run("tavily-request", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          tavilyChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(`[Tavily] Published loading status for node: ${nodeId}`);
      } catch (error) {
        console.error(`[Tavily] Failed to publish loading status:`, error);
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

      const apiKey = credentialResult.credential.apiKey;

      // Call Tavily API
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: query,
          max_results: maxResults,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      // Determine variable name (use provided or default)
      const variableName =
        data.variableName?.trim() || "tavily";

      // Store data directly in context for simple variable access
      const updatedContext = {
        ...context,
        [variableName]: responseData,
      };

      // Publish success state
      if (publish) {
        try {
          await publish(
            tavilyChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(`[Tavily] Published success status for node: ${nodeId}`);
        } catch (error) {
          console.error(`[Tavily] Failed to publish success status:`, error);
        }
      }

      return updatedContext;
    } catch (error) {
      // Publish error state
      if (publish) {
        try {
          await publish(
            tavilyChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(`[Tavily] Published error status for node: ${nodeId}`);
        } catch (publishError) {
          console.error(
            `[Tavily] Failed to publish error status:`,
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

