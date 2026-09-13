"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.validateEnv = validateEnv;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: parseInt(process.env.PORT || "3001", 10),
    MONGODB_URI: process.env.MONGODB_URI,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    AUTH_SECRET: process.env.AUTH_SECRET,
    UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
    NODE_ENV: process.env.NODE_ENV || "development",
    B2_KEY_ID: process.env.B2_KEY_ID || "",
    B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || "",
    B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
    B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
};
function validateEnv() {
    const required = ["MONGODB_URI", "AUTH_SECRET"];
    for (const key of required) {
        if (!process.env[key]) {
            console.error(`[env] Missing required variable: ${key}`);
            process.exit(1);
        }
    }
    const b2Required = ["B2_KEY_ID", "B2_APPLICATION_KEY", "B2_BUCKET_ID", "B2_BUCKET_NAME"];
    for (const key of b2Required) {
        if (!process.env[key])
            console.warn(`[env] B2 variable missing: ${key}`);
    }
}
