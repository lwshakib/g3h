import defineApp from "../../helpers/define-app.js";

export default defineApp({
  name: "HTTP Request",
  key: "http-request",
  icon: "Globe",
  description: "Call any external API endpoint from a workflow.",
  supportsConnections: false,
  baseUrl: "https://httpbin.org",
  apiBaseUrl: "https://httpbin.org",
  primaryColor: "#64748b",
  auth: {
    type: "none",
    instructions: "No connection required. Configure method and URL directly in the node.",
  },
  triggers: [],
  actions: [
    {
      key: "send-request",
      label: "Send Request",
      description: "Execute an HTTP request with configured method and URL.",
    },
  ],
});
