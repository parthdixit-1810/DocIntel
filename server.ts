import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import * as pdf from "pdf-parse";
import mammoth from "mammoth";
import cors from "cors";

// Extend Request type for multer
interface MulterRequest extends express.Request {
  file?: any; // Use any for simplicity if types are still problematic
}


// In-memory document store
type DocumentData = {
  id: string;
  name: string;
  text: string;
  analysis?: any;
  createdAt: number;
  version?: number;
};
const documents: DocumentData[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const upload = multer({ storage: multer.memoryStorage() });

  // API Route for document processing
  app.post("/api/extract-text", upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;
      const fileType = path.extname(fileName).toLowerCase();

      let text = "";

      if (fileType === ".pdf") {
        const data = await (pdf as any)(fileBuffer);
        text = data.text;
      } else if (fileType === ".docx") {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        text = result.value;
      } else if (fileType === ".txt") {
        text = fileBuffer.toString("utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      res.json({ text, fileName });
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: "Failed to extract text from document" });
    }
  });

  // REST API: List all documents
  app.get("/api/documents", (req, res) => {
    res.json(documents);
  });

  // REST API: Add a new document
  app.post("/api/documents", (req, res) => {
    const { name, text, analysis } = req.body;
    const doc: DocumentData = {
      id: Math.random().toString(36).slice(2),
      name,
      text,
      analysis,
      createdAt: Date.now(),
      version: 1,
    };
    documents.unshift(doc);
    res.status(201).json(doc);
  });

  // REST API: Update a document (optional)
  app.put("/api/documents/:id", (req, res) => {
    const { id } = req.params;
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    documents[idx] = { ...documents[idx], ...req.body };
    res.json(documents[idx]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
