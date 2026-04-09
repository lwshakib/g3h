import { NodeExecutor } from "@/features/executions/type";
import type { StripeTriggerNodeData } from "@/features/executions/node-data-types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export const stripeTriggerExecutor: NodeExecutor<
  StripeTriggerNodeData
> = async ({ nodeId, context, step, publish }) => {
  console.log(
    `[Stripe Trigger] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  const result = await step.run("stripe-trigger", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          stripeTriggerChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(
          `[Stripe Trigger] Published loading status for node: ${nodeId}`
        );
      } catch (error) {
        console.error(
          `[Stripe Trigger] Failed to publish loading status:`,
          error
        );
      }
    }

    try {
      // Stripe trigger just passes context through
      const updatedContext = context;

      // Publish success state
      if (publish) {
        try {
          await publish(
            stripeTriggerChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(
            `[Stripe Trigger] Published success status for node: ${nodeId}`
          );
        } catch (error) {
          console.error(
            `[Stripe Trigger] Failed to publish success status:`,
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
            stripeTriggerChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(
            `[Stripe Trigger] Published error status for node: ${nodeId}`
          );
        } catch (publishError) {
          console.error(
            `[Stripe Trigger] Failed to publish error status:`,
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

