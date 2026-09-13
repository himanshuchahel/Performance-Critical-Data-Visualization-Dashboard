with open('backend/src/controllers/datasetController.ts', 'r') as f:
    s = f.read()
s = s.replace('import fs from "fs";\nimport path from "path";', 'import { uploadFile, downloadFile, deleteFile } from "../services/b2Service";')
s = s.replace('const UPLOAD_DIR = env.UPLOAD_DIR || "./uploads";\n', '')
old_create = '''    const dataset = await Dataset.create({
      userId: new mongoose.Types.ObjectId(req.user!._id),
      name,
      originalFileName: file.originalname,
      fileType,
      fileSize: file.size,
      rowCount,
      columnCount,
      columns,
      status: "Ready",
      filePath: file.filename,
    });

    res.status(201).json({ success: true, message: "Dataset created", data: dataset });'''
new_create = '''    const userId = req.user!._id.toString();
    const datasetId = new mongoose.Types.ObjectId();
    const storageKey = `datasets/${userId}/${datasetId.toString()}/${file.originalname}`;
    let uploadResult: any = null;
    try {
      uploadResult = await uploadFile(storageKey, file.buffer, file.mimetype || "application/octet-stream");
    } catch (e: any) {
      return res.status(500).json({ success: false, message: "B2 upload failed: " + (e.message || "unknown") });
    }
    const dataset = await Dataset.create({
      _id: datasetId,
      userId: new mongoose.Types.ObjectId(userId),
      name,
      originalFileName: file.originalname,
      fileType,
      fileSize: file.size,
      rowCount,
      columnCount,
      columns,
      status: "Ready",
      storageKey,
      storageFileId: uploadResult.fileId,
    });
    res.status(201).json({ success: true, message: "Dataset created", data: dataset });'''
s = s.replace(old_create, new_create)
s = s.replace('fs.readFileSync(file.path, "utf8")', 'file.buffer.toString("utf8")')
s = s.replace('fs.readFileSync(file.path, "utf8")', 'file.buffer.toString("utf8")')
old_del = '''    const filePath = path.join(UPLOAD_DIR, dataset.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);'''
new_del = '''    try { await deleteFile(dataset.storageKey, dataset.storageFileId); } catch (e: any) { console.error("[delete] B2 delete error:", e.message || ""); }'''
s = s.replace(old_del, new_del)
old_down = '''    const filePath = path.join(UPLOAD_DIR, dataset.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "File not found" });
    res.download(filePath, dataset.originalFileName);'''
new_down = '''    try {
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
    }'''
s = s.replace(old_down, new_down)
with open('backend/src/controllers/datasetController.ts', 'w') as f:
    f.write(s)
print("ctrl updated")
