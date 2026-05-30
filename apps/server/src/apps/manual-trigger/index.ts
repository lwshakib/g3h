import defineApp from "../../helpers/define-app.js";

export default defineApp({
  name: "Manual Trigger",
  key: "manual-trigger",
  icon: "MousePointer",
  description: "Start workflows manually from the editor execute button.",
  supportsConnections: false,
  primaryColor: "#10b981",
  auth: {
    type: "none",
    instructions: "No connection required. This trigger starts runs manually.",
  },
  triggers: [
    {
      key: "manual-start",
      label: "Manual Start",
      description: "Runs only when a user manually executes the workflow.",
    },
  ],
  actions: [],
});
