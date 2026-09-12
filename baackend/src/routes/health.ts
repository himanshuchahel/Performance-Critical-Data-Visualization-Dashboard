import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const ready = mongoose.connection.readyState === 1;

    res.json({
      success: true,
      message: "API is healthy",
      status: "ok",
      db: ready ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      status: "error",
      message: "Health check failed",
    });
  }
});

export default router;