import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../config/upload";
import {
  createDataset, listDatasets, getDataset, updateDataset,
  duplicateDataset, deleteDataset, downloadDataset, getData,
} from "../controllers/datasetController";

const router = Router();

router.post("/", authMiddleware, upload.single("file"), createDataset);
router.get("/", authMiddleware, listDatasets);
router.get("/:id", authMiddleware, getDataset);
router.patch("/:id", authMiddleware, updateDataset);
router.post("/:id/duplicate", authMiddleware, duplicateDataset);
router.delete("/:id", authMiddleware, deleteDataset);
router.get("/:id/download", authMiddleware, downloadDataset);
router.get("/:id/data", authMiddleware, getData);

export default router;
