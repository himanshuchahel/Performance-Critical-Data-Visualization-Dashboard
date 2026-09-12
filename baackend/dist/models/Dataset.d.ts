import mongoose, { Document } from "mongoose";
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
export declare const Dataset: mongoose.Model<IDataset, {}, {}, {}, mongoose.Document<unknown, {}, IDataset, {}, {}> & IDataset & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
