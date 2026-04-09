import { NodeExecutor } from "@/features/executions/type";
import type { GoogleFormTriggerNodeData } from "@/features/executions/node-data-types";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

export const googleFormTriggerExecutor: NodeExecutor<
  GoogleFormTriggerNodeData
> = async ({ nodeId, context, step, publish }) => {
  console.log(
    `[Google Form Trigger] Executor called for node: ${nodeId}, publish available: ${!!publish}`
  );

  const result = await step.run("google-form-trigger", async () => {
    // Publish loading state inside step
    if (publish) {
      try {
        await publish(
          googleFormTriggerChannel().status({
            nodeId,
            status: "loading",
          })
        );
        console.log(
          `[Google Form Trigger] Published loading status for node: ${nodeId}`
        );
      } catch (error) {
        console.error(
          `[Google Form Trigger] Failed to publish loading status:`,
          error
        );
      }
    }

    try {
      // Google Form trigger just passes context through
      const updatedContext = context;

      // Publish success state
      if (publish) {
        try {
          await publish(
            googleFormTriggerChannel().status({
              nodeId,
              status: "success",
            })
          );
          console.log(
            `[Google Form Trigger] Published success status for node: ${nodeId}`
          );
        } catch (error) {
          console.error(
            `[Google Form Trigger] Failed to publish success status:`,
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
            googleFormTriggerChannel().status({
              nodeId,
              status: "error",
            })
          );
          console.log(
            `[Google Form Trigger] Published error status for node: ${nodeId}`
          );
        } catch (publishError) {
          console.error(
            `[Google Form Trigger] Failed to publish error status:`,
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
