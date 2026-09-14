import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import datasetRouter from "./routes/datasets";
export function createApp() {
  const app = express();

 const allowedOrigins = [
  "http://localhost:5173",
  "https://performance-critical-data-visualiza-three.vercel.app",
  "https://performance-critical-data-git-5e5220-himanshu-chehals-projects.vercel.app",
  "https://performance-critical-data-visualization-dashboard-en1ol492q.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Health route
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/datasets", datasetRouter);

  // 404 handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
      success: false,
      message: `Not found: ${req.method} ${req.path}`,
    });
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[error]", err.message || err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  });

  return app;
}