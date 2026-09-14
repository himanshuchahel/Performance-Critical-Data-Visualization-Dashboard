import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  MONGODB_URI: process.env.MONGODB_URI!,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173" || "https://performance-critical-data-visualiza-three.vercel.app" || "https://performance-critical-data-git-5e5220-himanshu-chehals-projects.vercel.app",
  AUTH_SECRET: process.env.AUTH_SECRET!,
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  NODE_ENV: process.env.NODE_ENV || "development",
  B2_KEY_ID: process.env.B2_KEY_ID || "",
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || "",
  B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
};

export function validateEnv() {
  const required = ["MONGODB_URI", "AUTH_SECRET"] as const;
  for (const key of required) {
    if (!process.env[key]) { console.error(`[env] Missing required variable: ${key}`); process.exit(1); }
  }
  const b2Required = ["B2_KEY_ID", "B2_APPLICATION_KEY", "B2_BUCKET_ID", "B2_BUCKET_NAME"] as const;
  for (const key of b2Required) {
    if (!process.env[key]) console.warn(`[env] B2 variable missing: ${key}`);
  }
}

