"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
(0, env_1.validateEnv)();
const app = (0, app_1.createApp)();
let server = null;
let shuttingDown = false;
async function gracefulShutdown(signal) {
    if (shuttingDown)
        return;
    shuttingDown = true;
    console.log(`[server] ${signal ?? "Shutdown"} received. Closing server...`);
    try {
        if (server) {
            await new Promise((resolve) => {
                server.close((err) => {
                    if (err) {
                        console.error("[server] Error while closing HTTP server:", err);
                    }
                    else {
                        console.log("[server] HTTP server closed");
                    }
                    resolve();
                });
            });
            server = null;
        }
        await (0, db_1.disconnectDB)();
        console.log("[server] MongoDB connection closed");
        process.exit(0);
    }
    catch (err) {
        console.error("[server] Error during shutdown:", err);
        process.exit(1);
    }
}
async function start() {
    try {
        await (0, db_1.connectDB)();
        server = http_1.default.createServer(app);
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.error(`[server] Port ${env_1.env.PORT} is already in use.`);
            }
            else {
                console.error("[server] HTTP server error:", err);
            }
            gracefulShutdown("SERVER_ERROR");
        });
        server.listen(env_1.env.PORT, () => {
            console.log(`[server] Running at http://localhost:${env_1.env.PORT}`);
            console.log(`[env] NODE_ENV=${env_1.env.NODE_ENV}, CLIENT_URL=${env_1.env.CLIENT_URL}`);
        });
        process.once("SIGINT", () => {
            void gracefulShutdown("SIGINT");
        });
        process.once("SIGTERM", () => {
            void gracefulShutdown("SIGTERM");
        });
        process.once("uncaughtException", (err) => {
            console.error("[fatal] Uncaught exception:", err);
            void gracefulShutdown("uncaughtException");
        });
        process.once("unhandledRejection", (reason) => {
            console.error("[fatal] Unhandled rejection:", reason);
            void gracefulShutdown("unhandledRejection");
        });
    }
    catch (err) {
        console.error("[fatal] Startup failed:", err);
        try {
            await (0, db_1.disconnectDB)();
        }
        catch {
            // Ignore DB disconnect errors during startup failure
        }
        process.exit(1);
    }
}
void start();
