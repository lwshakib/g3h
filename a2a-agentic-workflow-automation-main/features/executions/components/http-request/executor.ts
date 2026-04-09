import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky, { Options as KyOptions } from "ky";
import type { HttpRequestNodeData } from "@/features/executions/node-data-types";
import {
  replaceVariables,
} from "@/features/executions/lib/variable-parser";
import { httpRequestChannel } from "@/inngest/channels/http-request";

export const httpRequestExecutor: NodeExecutor<HttpRequestNodeData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
}) => {
  console.log(
    `[HTTP Request] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  if (!data.endpoint) {
    if (publish) {
      try {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        console.log(
          `[HTTP Request] Published error status (no endpoint) for node: ${nodeId}`
        );
      } catch (error) {
        console.error(`[HTTP Request] Failed to publish error status:`, error);
      }
    }
    throw new NonRetriableError("Endpoint is required");
  }

  // Replace variables in endpoint
  const originalEndpoint =
    typeof data.endpoint === "string" ? data.endpoint : String(data.endpoint);
  const endpoint = replaceVariables(originalEndpoint, context);

  // Log if replacement occurred (for debugging)
  if (originalEndpoint !== endpoint) {
    console.log(`Variable replacement: "${originalEndpoint}" -> "${endpoint}"`);
  } else if (originalEndpoint.includes("{{")) {
    console.warn(`No variables replaced in endpoint: "${originalEndpoint}"`, {
      contextKeys: Object.keys(context),
    });
  }

  const result = await step.run("http-request", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(
          `[HTTP Request] Published loading status for node: ${nodeId}`
        );
      } catch (error) {
        console.error(
          `[HTTP Request] Failed to publish loading status:`,
          error
        );
      }
    }

    try {
      const method = data.method || "GET";

      // Parse headers if it's a string, otherwise use as-is
      let headers: Record<string, string> = {};
      if (data.headers) {
        if (typeof data.headers === "string") {
          try {
            const parsedHeaders = JSON.parse(data.headers);
            // Replace variables in header values
            const processedHeaders: Record<string, string> = {};
            for (const [key, value] of Object.entries(parsedHeaders)) {
              processedHeaders[key] = replaceVariables(String(value), context);
            }
            headers = processedHeaders;
          } catch {
            // If parsing fails, treat as empty object
            headers = {};
          }
        } else if (
          typeof data.headers === "object" &&
          !Array.isArray(data.headers)
        ) {
          // Replace variables in header values
          const processedHeaders: Record<string, string> = {};
          for (const [key, value] of Object.entries(data.headers)) {
            processedHeaders[key] = replaceVariables(String(value), context);
          }
          headers = processedHeaders;
        }
      }

      const options: KyOptions = {
        method,
      };

      if (["POST", "PUT", "PATCH"].includes(method)) {
        if (data.body !== undefined && data.body !== null) {
          const bodyString =
            typeof data.body === "string"
              ? data.body
              : JSON.stringify(data.body);
          // Replace variables in body
          options.body = replaceVariables(bodyString, context);
        }
      }
      const response = await ky(endpoint, {
        ...options,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      });
      const contentType = response.headers.get("content-type");
      const responseData =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : await response.text();

      // Determine variable name (use provided or default)
      const variableName =
        data.variableName?.trim() || "response";

      // Store data directly in context for simple variable access
      // This allows using users[0].id instead of users.httpResponse.data[0].id
      const updatedContext = {
        ...context,
        [variableName]: responseData,
      };

      // Publish success state
      if (publish) {
        try {
          await publish(
            httpRequestChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(
            `[HTTP Request] Published success status for node: ${nodeId}`
          );
        } catch (error) {
          console.error(
            `[HTTP Request] Failed to publish success status:`,
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
            httpRequestChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(
            `[HTTP Request] Published error status for node: ${nodeId}`
          );
        } catch (publishError) {
          console.error(
            `[HTTP Request] Failed to publish error status:`,
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
