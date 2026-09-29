import express from "express";
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
} from "../controllers/quiz.Controller";
import protect from "../middleware/auth";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/documentId", getQuizzes);
router.get("/quiz/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);
router.delete("/:id", deleteQuiz);

export default router;
