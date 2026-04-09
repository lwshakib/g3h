import { z } from "zod";

// Workflow creation schema
export const createWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .max(1024, "Description must be less than 1024 characters")
    .trim()
    .optional()
    .default(""),
});

// Workflow update schema
export const updateWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .max(1024, "Description must be less than 1024 characters")
    .trim()
    .optional()
    .default(""),
});

// Workflow query parameters schema
export const getWorkflowsSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  search: z.string().optional().default(""),
});

// Workflow ID parameter schema
export const workflowIdSchema = z.object({
  id: z.string().uuid("Invalid workflow ID format"),
});

// Type exports
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type GetWorkflowsInput = z.infer<typeof getWorkflowsSchema>;

