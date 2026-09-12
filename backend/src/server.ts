import "dotenv/config";
import http from "http";
import { createApp } from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env, validateEnv } from "./config/env";

validateEnv();

const app = createApp();

let server: http.Server | null = null;
let shuttingDown = false;

async function gracefulShutdown(signal?: string) {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log(
    `[server] ${signal ?? "Shutdown"} received. Closing server...`
  );

  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server!.close((err) => {
          if (err) {
            console.error("[server] Error while closing HTTP server:", err);
          } else {
            console.log("[server] HTTP server closed");
          }

          resolve();
        });
      });

      server = null;
    }

    await disconnectDB();
    console.log("[server] MongoDB connection closed");

    process.exit(0);
  } catch (err) {
    console.error("[server] Error during shutdown:", err);
    process.exit(1);
  }
}

async function start() {
  try {
    await connectDB();

    server = http.createServer(app);

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `[server] Port ${env.PORT} is already in use.`
        );
      } else {
        console.error("[server] HTTP server error:", err);
      }

      gracefulShutdown("SERVER_ERROR");
    });

    server.listen(env.PORT, () => {
      console.log(
        `[server] Running at http://localhost:${env.PORT}`
      );
      console.log(
        `[env] NODE_ENV=${env.NODE_ENV}, CLIENT_URL=${env.CLIENT_URL}`
      );
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
  } catch (err) {
    console.error("[fatal] Startup failed:", err);

    try {
      await disconnectDB();
    } catch {
      // Ignore DB disconnect errors during startup failure
    }

    process.exit(1);
  }
}

void start();