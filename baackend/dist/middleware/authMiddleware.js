"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        res.status(401).json({ success: false, message: "Authentication required" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.AUTH_SECRET);
        req.user = { _id: decoded.userId, email: decoded.email, name: "" };
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired session" });
    }
}
