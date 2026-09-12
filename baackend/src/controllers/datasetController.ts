import { Request, Response } from "express";
import mongoose from "mongoose";
import { uploadFile, downloadFile, deleteFile } from "../services/b2Service";
import { Dataset } from "../models/Dataset";
import { AuthRequest } from "../types";
import { env } from "../config/env";
import XLSX from "xlsx";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function createDataset(req: AuthRequest, res: Response) {
  try {
    const file = (req as any).file;

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
    const ext =
      file.originalname.split(".").pop()?.toLowerCase() || "csv";

    // Detect supported file type
    let fileType: "CSV" | "JSON" | "Parquet" | "XLSX";

    if (ext === "csv") {
      fileType = "CSV";
    } else if (ext === "json") {
      fileType = "JSON";
    } else if (ext === "parquet") {
      fileType = "Parquet";
    } else if (ext === "xlsx" || ext === "xls") {
      fileType = "XLSX";
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported file type. Supported formats: CSV, JSON, Parquet, XLSX",
      });
    }

    let columns: string[] = [];
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
          .filter((line: string) => line.trim());

        if (lines.length > 0) {
          columns = lines[0]
            .split(",")
            .map((column: string) =>
              column.trim().replace(/^"|"$/g, "")
            );

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
        const workbook = XLSX.read(file.buffer, {
          type: "buffer",
        });

        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          throw new Error(
            "XLSX file does not contain any worksheet"
          );
        }

        const worksheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          worksheet,
          {
            defval: null,
          }
        );

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
    } catch (parseError) {
      console.error("[dataset] Metadata parsing failed:", parseError);

      // Keep upload working even if metadata parsing fails
      columns = [];
      rowCount = 0;
      columnCount = 0;
    }

    // Generate dataset ID
    const datasetId = new mongoose.Types.ObjectId();

    // Backblaze B2 storage key
    const storageKey =
      `datasets/${req.user!._id}/${datasetId.toString()}/${file.originalname}`;

    // Upload original file to Backblaze B2
    const uploaded = await uploadFile(
      storageKey,
      file.buffer,
      file.mimetype || "application/octet-stream"
    );

    // Create MongoDB dataset record
    const dataset = await Dataset.create({
      _id: datasetId,
      userId: req.user!._id,
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
  } catch (error) {
    console.error("[dataset] Create dataset error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create dataset",
    });
  }
}

export async function listDatasets(req: AuthRequest, res: Response) {
  try {
    const datasets = await Dataset.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: datasets });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || "Failed to list datasets" });
  }
}

export async function getDataset(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid dataset ID" });
    const dataset = await Dataset.findOne({ _id: id, userId: req.user!._id }).lean();
    if (!dataset) return res.status(404).json({ success: false, message: "Dataset not found" });
    res.json({ success: true, data: dataset });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || "Failed to get dataset" });
  }
}

export async function updateDataset(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid dataset ID" });
    const dataset = await Dataset.findOne({ _id: id, userId: req.user!._id });
    if (!dataset) return res.status(404).json({ success: false, message: "Dataset not found" });
    const name = req.body?.name?.trim();
    if (!name || typeof name !== "string" || name.length > 200) {
      return res.status(400).json({ success: false, message: "Invalid name" });
    }
    dataset.name = name;
    await dataset.save();
    res.json({ success: true, message: "Dataset updated", data: dataset });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || "Failed to update dataset" });
  }
}

export async function duplicateDataset(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid dataset ID" });
    const original = await Dataset.findOne({ _id: id, userId: req.user!._id });
    if (!original) return res.status(404).json({ success: false, message: "Dataset not found" });

    const newDatasetId = new mongoose.Types.ObjectId();
    const newStorageKey = `datasets/${original.userId.toString()}/${newDatasetId.toString()}/${original.originalFileName}`;
    try {
      const stream = await downloadFile(original.storageKey);
      const chunks: Buffer[] = [];
      for await (const chunk of stream as any) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const buf = Buffer.concat(chunks);
      const contentType =
        original.fileType === "JSON"
          ? "application/json"
          : original.fileType === "CSV"
          ? "text/csv"
          : original.fileType === "XLSX"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/octet-stream";

      const up = await uploadFile(
        newStorageKey,
        buf,
        contentType
      );
      const dup = await Dataset.create({
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
    } catch (e: any) {
      return res.status(500).json({ success: false, message: "Duplicate failed: " + (e.message || "unknown") });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || "Failed to duplicate dataset" });
  }
}

export async function deleteDataset(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid dataset ID" });
    const dataset = await Dataset.findOne({ _id: id, userId: req.user!._id });
    if (!dataset) return res.status(404).json({ success: false, message: "Dataset not found" });
    try {
      await deleteFile(dataset.storageKey, dataset.storageFileId);
    } catch (e: any) {
      console.error("[delete] B2 delete error:", e.message || "");
    }
    await Dataset.deleteOne({ _id: id, userId: req.user!._id });
    res.json({ success: true, message: "Dataset deleted" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || "Failed to delete dataset" });
  }
}

export async function downloadDataset(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid dataset ID" });
    const dataset = await Dataset.findOne({ _id: id, userId: req.user!._id });
    if (!dataset) return res.status(404).json({ success: false, message: "Dataset not found" });
    try {
      const stream = await downloadFile(dataset.storageKey);
      res.setHeader("Content-Disposition", `attachment; filename="${dataset.originalFileName}"`);
      res.setHeader("Content-Type", dataset.fileType === "CSV" ? "text/csv" : dataset.fileType === "JSON" ? "application/json" : "application/octet-stream");
      const reader = (stream as any).getReader ? (stream as any).getReader() : null;
      if (reader) {
        const chunks: Buffer[] = [];
        (async () => {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) { res.end(Buffer.concat(chunks)); return; }
            chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(value));
          }
        })();
      } else {
        const chunks: Buffer[] = [];
        for await (const chunk of stream as any) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        res.send(Buffer.concat(chunks));
      }
    } catch (e: any) {
      return res.status(404).json({ success: false, message: "File not found or B2 error" });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || "Failed to download" });
  }
}

export async function getData(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataset ID",
      });
    }

    const dataset = await Dataset.findOne({
      _id: id,
      userId: req.user!._id,
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    const page = Math.max(
      1,
      parseInt(req.query.page as string) || 1
    );

    const limit = Math.min(
      200,
      Math.max(5, parseInt(req.query.limit as string) || 50)
    );

    const search = (
      (req.query.search as string) || ""
    ).toLowerCase();

    const sortBy =
      (req.query.sortBy as string) ||
      dataset.columns[0] ||
      "";

    const sortOrder =
      (req.query.sortOrder as string) === "desc" ? -1 : 1;

    let fileBuffer: Buffer;

    try {
      const stream = await downloadFile(dataset.storageKey);

      const chunks: Buffer[] = [];

      for await (const chunk of stream as any) {
        chunks.push(
          Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk)
        );
      }

      fileBuffer = Buffer.concat(chunks);
    } catch {
      return res.status(404).json({
        success: false,
        message: "File missing or B2 error",
      });
    }

    let rows: any[] = [];

    if (dataset.fileType === "CSV") {
      const content = fileBuffer.toString("utf8");

      const lines = content
        .split(/\r?\n/)
        .filter((l) => l.trim());

      if (lines.length > 0) {
        const headers = lines[0]
          .split(",")
          .map((h: string) =>
            h.trim().replace(/^"|"$/g, "")
          );

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");

          const obj: any = {};

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
      const workbook = XLSX.read(fileBuffer, {
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

      rows = XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: null,
        }
      );
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
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });

      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        return res.status(400).json({
          success: false,
          message: "XLSX file has no worksheets",
        });
      }

      const worksheet = workbook.Sheets[firstSheetName];

      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        worksheet,
        {
          defval: null,
        }
      );
    }

    if (search) {
      rows = rows.filter((r: any) =>
        Object.values(r).some((v: any) =>
          String(v)
            .toLowerCase()
            .includes(search)
        )
      );
    }

    if (
      sortBy &&
      rows.length > 0 &&
      rows[0][sortBy] !== undefined
    ) {
      rows.sort((a: any, b: any) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (
          typeof av === "number" &&
          typeof bv === "number"
        ) {
          return (av - bv) * sortOrder;
        }
        return (
          String(av).localeCompare(String(bv)) *
          sortOrder
        );
      });
    }
    const total = rows.length;
    const start = (page - 1) * limit;
    const paginated = rows.slice(
      start,
      start + limit
    );
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
  } catch (e: any) {
    console.error("[dataset] Get data error:", e);

    return res.status(500).json({
      success: false,
      message: e.message || "Failed to read data",
    });
  }
}
