"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDB() {
    try {
        await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        console.log(`[db] Connected to MongoDB`);
    }
    catch (err) {
        console.error("[db] MongoDB connection failed:", err);
        process.exit(1);
    }
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
    console.log("[db] Disconnected from MongoDB");
}
