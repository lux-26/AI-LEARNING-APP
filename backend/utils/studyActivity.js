import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import StudyProgress from "../models/StudyProgress.js";
import User from "../models/User.js";

const startOfDay = (date) => {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

const daysBetween = (firstDate, secondDate) =>
  Math.round(
    (startOfDay(secondDate).getTime() - startOfDay(firstDate).getTime()) /
      86400000,
  );

const calculateProgress = ({
  summaryViewed,
  quizzesCompleted,
  flashcardsReviewed,
  chatInteractions,
}) => {
  const completedActivities = [
    summaryViewed,
    quizzesCompleted > 0,
    flashcardsReviewed > 0,
    chatInteractions > 0,
  ].filter(Boolean).length;

  return Math.round((completedActivities / 4) * 100);
};

const updateBadges = async (user) => {
  const [documentCount, completedQuizCount, reviewedFlashcardCount] =
    await Promise.all([
      Document.countDocuments({ userId: user._id }),
      Quiz.countDocuments({
        userId: user._id,
        completedAt: { $ne: null },
      }),
      Flashcard.aggregate([
        { $match: { userId: user._id } },
        { $unwind: "$cards" },
        { $group: { _id: null, count: { $sum: "$cards.reviewCount" } } },
      ]),
    ]);

  const reviewedCount = reviewedFlashcardCount[0]?.count || 0;
  const badges = new Set(user.badges || []);

  if (documentCount >= 1) badges.add("first-document");
  if (completedQuizCount >= 1) badges.add("first-quiz");
  if (reviewedCount >= 1) badges.add("first-flashcard");
  if (completedQuizCount >= 1) {
    const perfectQuiz = await Quiz.exists({
      userId: user._id,
      completedAt: { $ne: null },
      score: 100,
    });
    if (perfectQuiz) badges.add("perfect-quiz");
  }
  if (user.streakCount >= 7) badges.add("seven-day-streak");
  if (reviewedCount >= 50) badges.add("fifty-flashcards");
  if (completedQuizCount >= 10) badges.add("ten-quizzes");

  user.badges = [...badges];
  await user.save();
};

export const recordLearningActivity = async ({
  userId,
  documentId,
  activity,
}) => {
  const now = new Date();
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilisateur introuvable pour l'activité d'apprentissage");
  }

  if (!user.lastActiveDate) {
    user.streakCount = 1;
  } else {
    const elapsedDays = daysBetween(user.lastActiveDate, now);
    if (elapsedDays === 1) user.streakCount += 1;
    else if (elapsedDays > 1) user.streakCount = 1;
  }
  user.lastActiveDate = now;
  await user.save();

  if (!documentId) {
    await updateBadges(user);
    return;
  }

  const increments = {
    summary: { summaryViewed: true },
    chat: { $inc: { chatInteractions: 1 } },
    flashcard: { $inc: { flashcardsReviewed: 1 } },
    quiz: { $inc: { quizzesCompleted: 1 } },
  };
  const update = increments[activity];

  if (!update) {
    throw new Error(`Activité d'apprentissage inconnue: ${activity}`);
  }

  const progress = await StudyProgress.findOneAndUpdate(
    { userId, documentId },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  progress.progress = calculateProgress(progress);
  await progress.save();
  await updateBadges(user);
};
