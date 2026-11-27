import Quiz from "..//models/Quiz.js";

// @desc     Get all quizzes for a document
// @route    GET /api/quizzes/:documentId
// @access   Private
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Get a single quiz by ID
// @route     GET /api/quizzes/quiz/:id
// @access    Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    // Ne jamais exposer les réponses correctes avant la soumission du quiz.
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(({ correctAnswer, ...question }) => question);

    res.status(200).json({
      success: true,
      data: quizData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Submit quiz answers
// @route     POST /api/quizzes/:id/submit
// @access    Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide answers array",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
        statusCode: 400,
      });
    }

    // Validate and process answers without accepting duplicate or invalid indices.
    let correctCount = 0;
    const userAnswers = [];
    const seenIndices = new Set();

    for (const answer of answers) {
      const { questionIndex, selectedAnswer } = answer ?? {};
      if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= quiz.questions.length || seenIndices.has(questionIndex)) {
        return res.status(400).json({ success: false, error: "Index de question invalide ou dupliqué", statusCode: 400 });
      }
      if (typeof selectedAnswer !== "string" || !quiz.questions[questionIndex].options.includes(selectedAnswer)) {
        return res.status(400).json({ success: false, error: "Réponse sélectionnée invalide", statusCode: 400 });
      }
      seenIndices.add(questionIndex);
      const question = quiz.questions[questionIndex];
      const isCorrect = selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      userAnswers.push({ questionIndex, selectedAnswer, isCorrect, answeredAt: new Date() });
    }

    // Calculate score
    const score = quiz.totalQuestions > 0 ? Math.round((correctCount / quiz.totalQuestions) * 100) : 0;

    // Update quiz
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: score,
        userAnswers,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Get quiz results
// @route     GET /api/quizzes/:id/results
// @access    Private
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz not completed yet",
        statusCode: 400,
      });
    }

    // Build detailed results
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswers = quiz.userAnswers.find(
        (a) => a.questionIndex === index,
      );

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: userAnswers?.selectedAnswer || null,
        isCorrect: userAnswers?.isCorrect || false,
        explanation: question.explanation,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt,
        },
        results: detailedResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Delete quiz
// @route     Delete /api/quizzes/:id
// @access    Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// @desc      Get all quizzes for the authenticated user
// @route     GET /api/quizzes
// @access    Private
export const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};
