import { NodeExecutor } from "@/features/executions/type";
import type { ManualTriggerNodeData } from "@/features/executions/node-data-types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

export const manualTriggerExecutor: NodeExecutor<
  ManualTriggerNodeData
> = async ({ nodeId, context, step, publish }) => {
  console.log(
    `[Manual Trigger] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  const result = await step.run("manual-trigger", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          manualTriggerChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(
          `[Manual Trigger] Published loading status for node: ${nodeId}`
        );
      } catch (error) {
        console.error(
          `[Manual Trigger] Failed to publish loading status:`,
          error
        );
      }
    }

    try {
      // Manual trigger just passes context through
      const updatedContext = context;

      // Publish success state
      if (publish) {
        try {
          await publish(
            manualTriggerChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(
            `[Manual Trigger] Published success status for node: ${nodeId}`
          );
        } catch (error) {
          console.error(
            `[Manual Trigger] Failed to publish success status:`,
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
            manualTriggerChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(
            `[Manual Trigger] Published error status for node: ${nodeId}`
          );
        } catch (publishError) {
          console.error(
            `[Manual Trigger] Failed to publish error status:`,
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
