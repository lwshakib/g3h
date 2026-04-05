import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const WEB_URL = process.env.WEB_URL;
export const DATABASE_URL = process.env.DATABASE_URL;
