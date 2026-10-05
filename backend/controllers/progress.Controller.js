import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import StudyProgress from "../models/StudyProgress.js";
import User from "../models/User.js";

// @desc       Récupérer les statistiques d’apprentissage de l’utilisateur
// @route      GET /api/progress/dashboard
// @accesss     Privée
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select(
      "streakCount badges dailyGoal",
    );

    // Récupérer les compteurs
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    // Récupérer les statistiques des fiches
    const flashcardSets = await Flashcard.find({ userId });
    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let masteredFlashcards = 0;
    let cardsToReviewToday = 0;
    let starredFlashcards = 0;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter((c) => c.reviewCount > 0).length;
      masteredFlashcards += set.cards.filter(
        (c) => c.reviewCount >= 3 && c.difficulty === "easy",
      ).length;
      cardsToReviewToday += set.cards.filter(
        (c) => !c.nextReviewDate || c.nextReviewDate <= today,
      ).length;
      starredFlashcards += set.cards.filter((c) => c.isStarred).length;
    });

    // Récupérer les statistiques des quiz
    const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length,
          )
        : 0;

    // Activité récente
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select("title fileName lastAccessed status");

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("documentId", "title")
      .select("title score totalQuestions completedAt createdAt");

    const progress = await StudyProgress.find({ userId })
      .populate("documentId", "title")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak: user?.streakCount || 0,
          badges: user?.badges || [],
          dailyGoal: user?.dailyGoal || 1,
          masteredFlashcards,
          cardsToReviewToday,
        },
        progress,
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
