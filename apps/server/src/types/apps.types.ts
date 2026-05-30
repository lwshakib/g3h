export type AppEntity = {
  key: string;
  label: string;
  description?: string;
};

export type AppDefinition = {
  name: string;
  key: string;
  icon?: string;
  description?: string;
  supportsConnections?: boolean;
  baseUrl?: string;
  apiBaseUrl?: string;
  primaryColor?: string;
  triggers?: AppEntity[];
  actions?: AppEntity[];
  auth?: {
    type: "none" | "apiKey" | "oauth2";
    instructions?: string;
  };
};
