"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
class StorageService {
    constructor() {
        this.dir = env_1.env.UPLOAD_DIR;
        if (!fs_1.default.existsSync(this.dir))
            fs_1.default.mkdirSync(this.dir, { recursive: true });
    }
    save(filename, buffer) {
        const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;
        const filePath = path_1.default.join(this.dir, unique);
        fs_1.default.writeFileSync(filePath, buffer);
        return filePath;
    }
    get(filePath) {
        if (!fs_1.default.existsSync(filePath))
            throw new Error("File not found");
        return fs_1.default.readFileSync(filePath);
    }
    delete(filePath) {
        if (fs_1.default.existsSync(filePath))
            fs_1.default.unlinkSync(filePath);
    }
}
exports.StorageService = StorageService;
