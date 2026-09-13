"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const health_1 = __importDefault(require("./routes/health"));
const auth_1 = __importDefault(require("./routes/auth"));
const datasets_1 = __importDefault(require("./routes/datasets"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: env_1.env.CLIENT_URL,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.use((0, cookie_parser_1.default)());
    // Health route
    app.use("/api/health", health_1.default);
    app.use("/api/auth", auth_1.default);
    app.use("/api/datasets", datasets_1.default);
    // 404 handler
    app.use((req, res, next) => {
        res.status(404).json({
            success: false,
            message: `Not found: ${req.method} ${req.path}`,
        });
    });
    // Error handler
    app.use((err, _req, res, _next) => {
        console.error("[error]", err.message || err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    });
    return app;
}
