import type { AppDefinition } from "../types/apps.types.js";
import httpRequestApp from "./http-request/index.js";
import manualTriggerApp from "./manual-trigger/index.js";

export const appsRegistry: AppDefinition[] = [manualTriggerApp, httpRequestApp];

export const getAppByKey = (key: string) => {
  return appsRegistry.find((app) => app.key === key) ?? null;
};
