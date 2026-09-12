"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataset = createDataset;
exports.listDatasets = listDatasets;
exports.getDataset = getDataset;
exports.updateDataset = updateDataset;
exports.duplicateDataset = duplicateDataset;
exports.deleteDataset = deleteDataset;
exports.downloadDataset = downloadDataset;
exports.getData = getData;
const mongoose_1 = __importDefault(require("mongoose"));
const b2Service_1 = require("../services/b2Service");
const Dataset_1 = require("../models/Dataset");
const xlsx_1 = __importDefault(require("xlsx"));
function isValidObjectId(id) {
    return mongoose_1.default.Types.ObjectId.isValid(id);
}
async function createDataset(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required",
            });
        }
        const name = file.originalname.replace(/\.[^/.]+$/, "").trim();
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Invalid file name",
            });
        }
        // Get file extension
        const ext = file.originalname.split(".").pop()?.toLowerCase() || "csv";
        // Detect supported file type
        let fileType;
        if (ext === "csv") {
            fileType = "CSV";
        }
        else if (ext === "json") {
            fileType = "JSON";
        }
        else if (ext === "parquet") {
            fileType = "Parquet";
        }
        else if (ext === "xlsx" || ext === "xls") {
            fileType = "XLSX";
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Unsupported file type. Supported formats: CSV, JSON, Parquet, XLSX",
            });
        }
        let columns = [];
        let rowCount = 0;
        let columnCount = 0;
        // Parse file metadata
        try {
            // =========================
            // CSV
            // =========================
            if (fileType === "CSV") {
                const content = file.buffer
                    .toString("utf8")
                    .slice(0, 200000);
                const lines = content
                    .split(/\r?\n/)
                    .filter((line) => line.trim());
                if (lines.length > 0) {
                    columns = lines[0]
                        .split(",")
                        .map((column) => column.trim().replace(/^"|"$/g, ""));
                    columnCount = columns.length;
                    rowCount = Math.max(0, lines.length - 1);
                }
            }
            else if (fileType === "JSON") {
                const content = file.buffer
                    .toString("utf8")
                    .slice(0, 200000);
                const parsed = JSON.parse(content);
                const arr = Array.isArray(parsed)
                    ? parsed
                    : parsed.data || parsed.rows || parsed;
                if (Array.isArray(arr) && arr.length > 0) {
                    const obj = arr[0];
                    if (obj && typeof obj === "object") {
                        columns = Object.keys(obj);
                        columnCount = columns.length;
                    }
                    // Approximate row count
                    const chunk = file.buffer
                        .toString("utf8")
                        .slice(0, 100000);
                    rowCount = Math.max(0, chunk.split("{").length - 1);
                }
            }
            else if (fileType === "XLSX") {
                const workbook = xlsx_1.default.read(file.buffer, {
                    type: "buffer",
                });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    throw new Error("XLSX file does not contain any worksheet");
                }
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = xlsx_1.default.utils.sheet_to_json(worksheet, {
                    defval: null,
                });
                if (rows.length > 0) {
                    columns = Object.keys(rows[0]);
                    columnCount = columns.length;
                    rowCount = rows.length;
                }
            }
            // =========================
            // Parquet
            // =========================
            else if (fileType === "Parquet") {
                // Existing basic metadata behavior
                columnCount = 0;
                rowCount = 0;
            }
        }
        catch (parseError) {
            console.error("[dataset] Metadata parsing failed:", parseError);
            // Keep upload working even if metadata parsing fails
            columns = [];
            rowCount = 0;
            columnCount = 0;
        }
        // Generate dataset ID
        const datasetId = new mongoose_1.default.Types.ObjectId();
        // Backblaze B2 storage key
        const storageKey = `datasets/${req.user._id}/${datasetId.toString()}/${file.originalname}`;
        // Upload original file to Backblaze B2
        const uploaded = await (0, b2Service_1.uploadFile)(storageKey, file.buffer, file.mimetype || "application/octet-stream");
        // Create MongoDB dataset record
        const dataset = await Dataset_1.Dataset.create({
            _id: datasetId,
            userId: req.user._id,
            name,
            originalFileName: file.originalname,
            fileType,
            fileSize: file.size,
            rowCount,
            columnCount,
            columns,
            status: "Ready",
            storageKey: uploaded.storageKey,
            storageFileId: uploaded.fileId,
        });
        return res.status(201).json({
            success: true,
            message: "Dataset created",
            data: dataset,
        });
    }
    catch (error) {
        console.error("[dataset] Create dataset error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create dataset",
        });
    }
}
async function listDatasets(req, res) {
    try {
        const datasets = await Dataset_1.Dataset.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: datasets });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message || "Failed to list datasets" });
    }
}
async function getDataset(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ success: false, message: "Invalid dataset ID" });
        const dataset = await Dataset_1.Dataset.findOne({ _id: id, userId: req.user._id }).lean();
        if (!dataset)
            return res.status(404).json({ success: false, message: "Dataset not found" });
        res.json({ success: true, data: dataset });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message || "Failed to get dataset" });
    }
}
async function updateDataset(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ success: false, message: "Invalid dataset ID" });
        const dataset = await Dataset_1.Dataset.findOne({ _id: id, userId: req.user._id });
        if (!dataset)
            return res.status(404).json({ success: false, message: "Dataset not found" });
        const name = req.body?.name?.trim();
        if (!name || typeof name !== "string" || name.length > 200) {
            return res.status(400).json({ success: false, message: "Invalid name" });
        }
        dataset.name = name;
        await dataset.save();
        res.json({ success: true, message: "Dataset updated", data: dataset });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message || "Failed to update dataset" });
    }
}
async function duplicateDataset(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ success: false, message: "Invalid dataset ID" });
        const original = await Dataset_1.Dataset.findOne({ _id: id, userId: req.user._id });
        if (!original)
            return res.status(404).json({ success: false, message: "Dataset not found" });
        const newDatasetId = new mongoose_1.default.Types.ObjectId();
        const newStorageKey = `datasets/${original.userId.toString()}/${newDatasetId.toString()}/${original.originalFileName}`;
        try {
            const stream = await (0, b2Service_1.downloadFile)(original.storageKey);
            const chunks = [];
            for await (const chunk of stream)
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            const buf = Buffer.concat(chunks);
            const contentType = original.fileType === "JSON"
                ? "application/json"
                : original.fileType === "CSV"
                    ? "text/csv"
                    : original.fileType === "XLSX"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "application/octet-stream";
            const up = await (0, b2Service_1.uploadFile)(newStorageKey, buf, contentType);
            const dup = await Dataset_1.Dataset.create({
                _id: newDatasetId,
                userId: original.userId,
                name: `${original.name} Copy`,
                originalFileName: original.originalFileName,
                fileType: original.fileType,
                fileSize: original.fileSize,
                rowCount: original.rowCount,
                columnCount: original.columnCount,
                columns: original.columns,
                status: original.status,
                storageKey: newStorageKey,
                storageFileId: up.fileId,
            });
            return res.status(201).json({ success: true, message: "Dataset duplicated", data: dup });
        }
        catch (e) {
            return res.status(500).json({ success: false, message: "Duplicate failed: " + (e.message || "unknown") });
        }
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message || "Failed to duplicate dataset" });
    }
}
async function deleteDataset(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ success: false, message: "Invalid dataset ID" });
        const dataset = await Dataset_1.Dataset.findOne({ _id: id, userId: req.user._id });
        if (!dataset)
            return res.status(404).json({ success: false, message: "Dataset not found" });
        try {
            await (0, b2Service_1.deleteFile)(dataset.storageKey, dataset.storageFileId);
        }
        catch (e) {
            console.error("[delete] B2 delete error:", e.message || "");
        }
        await Dataset_1.Dataset.deleteOne({ _id: id, userId: req.user._id });
        res.json({ success: true, message: "Dataset deleted" });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message || "Failed to delete dataset" });
    }
}
async function downloadDataset(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ success: false, message: "Invalid dataset ID" });
        const dataset = await Dataset_1.Dataset.findOne({ _id: id, userId: req.user._id });
        if (!dataset)
            return res.status(404).json({ success: false, message: "Dataset not found" });
        try {
            const stream = await (0, b2Service_1.downloadFile)(dataset.storageKey);
            res.setHeader("Content-Disposition", `attachment; filename="${dataset.originalFileName}"`);
            res.setHeader("Content-Type", dataset.fileType === "CSV" ? "text/csv" : dataset.fileType === "JSON" ? "application/json" : "application/octet-stream");
            const reader = stream.getReader ? stream.getReader() : null;
            if (reader) {
                const chunks = [];
                (async () => {
                    for (;;) {
                        const { done, value } = await reader.read();
                        if (done) {
                            res.end(Buffer.concat(chunks));
                            return;
                        }
                        chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(value));
                    }
                })();
            }
            else {
                const chunks = [];
                for await (const chunk of stream)
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                res.send(Buffer.concat(chunks));
            }
        }
        catch (e) {
            return res.status(404).json({ success: false, message: "File not found or B2 error" });
        }
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message || "Failed to download" });
    }
}
async function getData(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dataset ID",
            });
        }
        const dataset = await Dataset_1.Dataset.findOne({
            _id: id,
            userId: req.user._id,
        });
        if (!dataset) {
            return res.status(404).json({
                success: false,
                message: "Dataset not found",
            });
        }
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(200, Math.max(5, parseInt(req.query.limit) || 50));
        const search = (req.query.search || "").toLowerCase();
        const sortBy = req.query.sortBy ||
            dataset.columns[0] ||
            "";
        const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
        let fileBuffer;
        try {
            const stream = await (0, b2Service_1.downloadFile)(dataset.storageKey);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.isBuffer(chunk)
                    ? chunk
                    : Buffer.from(chunk));
            }
            fileBuffer = Buffer.concat(chunks);
        }
        catch {
            return res.status(404).json({
                success: false,
                message: "File missing or B2 error",
            });
        }
        let rows = [];
        if (dataset.fileType === "CSV") {
            const content = fileBuffer.toString("utf8");
            const lines = content
                .split(/\r?\n/)
                .filter((l) => l.trim());
            if (lines.length > 0) {
                const headers = lines[0]
                    .split(",")
                    .map((h) => h.trim().replace(/^"|"$/g, ""));
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(",");
                    const obj = {};
                    headers.forEach((h, idx) => {
                        obj[h] =
                            values[idx]
                                ?.trim()
                                .replace(/^"|"$/g, "") ?? "";
                    });
                    rows.push(obj);
                }
            }
        }
        else if (dataset.fileType === "JSON") {
            const content = fileBuffer.toString("utf8");
            const parsed = JSON.parse(content);
            rows = Array.isArray(parsed)
                ? parsed
                : parsed.data || parsed.rows || [];
        }
        else if (dataset.fileType === "XLSX") {
            const workbook = xlsx_1.default.read(fileBuffer, {
                type: "buffer",
            });
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
                return res.status(400).json({
                    success: false,
                    message: "XLSX file does not contain any worksheet",
                });
            }
            const worksheet = workbook.Sheets[firstSheetName];
            rows = xlsx_1.default.utils.sheet_to_json(worksheet, {
                defval: null,
            });
        }
        else if (dataset.fileType === "Parquet") {
            return res.json({
                success: true,
                message: "Parquet data preview not implemented",
                data: {
                    rows: [],
                    total: 0,
                    page,
                    limit,
                    columns: dataset.columns,
                },
            });
        }
        else if (dataset.fileType === "XLSX") {
            const workbook = xlsx_1.default.read(fileBuffer, { type: "buffer" });
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
                return res.status(400).json({
                    success: false,
                    message: "XLSX file has no worksheets",
                });
            }
            const worksheet = workbook.Sheets[firstSheetName];
            rows = xlsx_1.default.utils.sheet_to_json(worksheet, {
                defval: null,
            });
        }
        if (search) {
            rows = rows.filter((r) => Object.values(r).some((v) => String(v)
                .toLowerCase()
                .includes(search)));
        }
        if (sortBy &&
            rows.length > 0 &&
            rows[0][sortBy] !== undefined) {
            rows.sort((a, b) => {
                const av = a[sortBy];
                const bv = b[sortBy];
                if (typeof av === "number" &&
                    typeof bv === "number") {
                    return (av - bv) * sortOrder;
                }
                return (String(av).localeCompare(String(bv)) *
                    sortOrder);
            });
        }
        const total = rows.length;
        const start = (page - 1) * limit;
        const paginated = rows.slice(start, start + limit);
        return res.json({
            success: true,
            data: {
                rows: paginated,
                total,
                page,
                limit,
                columns: dataset.columns,
            },
        });
    }
    catch (e) {
        console.error("[dataset] Get data error:", e);
        return res.status(500).json({
            success: false,
            message: e.message || "Failed to read data",
        });
    }
}
