import mongoose, { Schema, Document } from "mongoose";

export interface IDataset extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  originalFileName: string;
  fileType: "CSV" | "JSON" | "Parquet" | "XLSX";
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: string[];
  storageKey: string;
  storageFileId: string;
  status: "Ready" | "Processing" | "Failed";
  createdAt: Date;
  updatedAt: Date;
}

const DatasetSchema = new Schema<IDataset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    originalFileName: { type: String, required: true },
    fileType: { type: String, enum: ["CSV", "JSON", "Parquet", "XLSX"], required: true},
    fileSize: { type: Number, required: true },
    rowCount: { type: Number, default: 0 },
    columnCount: { type: Number, default: 0 },
    columns: [{ type: String }],
    status: { type: String, enum: ["Ready", "Processing", "Failed"], default: "Ready" },
    storageKey: { type: String, required: true },
    storageFileId: { type: String, required: true },
  },
  { timestamps: true }
);

DatasetSchema.index({ userId: 1, createdAt: -1 });

export const Dataset = mongoose.model<IDataset>("Dataset", DatasetSchema);
