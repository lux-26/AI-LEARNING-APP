import express from "express";
import {
  getQuizzes,
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
} from "../controllers/quiz.Controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

router.get("/", getAllQuizzes);
router.get("/quiz/:id", getQuizById);
router.get("/:documentId", getQuizzes);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);
router.delete("/:id", deleteQuiz);

export default router;
