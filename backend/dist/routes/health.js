"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    try {
        const ready = mongoose_1.default.connection.readyState === 1;
        res.json({
            success: true,
            message: "API is healthy",
            status: "ok",
            db: ready ? "connected" : "disconnected",
            timestamp: new Date().toISOString(),
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            status: "error",
            message: "Health check failed",
        });
    }
});
exports.default = router;
