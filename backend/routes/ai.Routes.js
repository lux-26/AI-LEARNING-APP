import express from "express";
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
} from "../controllers/ai.Controller.js";
import protect from "../middleware/auth.js";
import aiRateLimit from "../middleware/aiRateLimit.js";

const router = express.Router();

router.use(protect);

// Le quota concerne les opérations qui sollicitent la génération IA.
router.post("/generate-flashcards", aiRateLimit, generateFlashcards);
router.post("/generate-quiz", aiRateLimit, generateQuiz);
router.post("/generate-summary", aiRateLimit, generateSummary);
router.post("/chat", aiRateLimit, chat);
router.post("/explain-concept", aiRateLimit, explainConcept);
router.get("/chat-history/:documentId", getChatHistory);

export default router;
