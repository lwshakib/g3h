export const NODE_TYPES = [
  "INITIAL",
  "MANUAL_TRIGGER",
  "HTTP_REQUEST",
  "GOOGLE_FORM_TRIGGER",
  "GEMINI",
  "ANTHROPIC",
  "OPENAI",
  "STRIPE_TRIGGER",
  "DISCORD",
  "SLACK",
  "TAVILY",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const EXECUTION_STATUSES = ["RUNNING", "SUCCESS", "ERROR"] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];
