import express, { Router } from "express";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/document.Controller.js";

import protect from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = Router();

// Toutes les routes sont protégées
router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);


export default router;
