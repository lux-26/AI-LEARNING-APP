import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";
import { createNotification } from "../utils/notificationService.js";

// @desc     Générer des fiches à partir du document
// @route    POST /api/ai/generate-flashcards
// @access  Privée
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir l’identifiant du document",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document introuvable ou pas encore prêt",
        statusCode: 404,
      });
    }

    // Générer des fiches avec Gemini
    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count),
    );

    // Enregistrer dans la base de données
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Fiches générées avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Générer un quiz à partir du document
// @route    POST /api/ai/generate-quiz
// @access  Privée
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5, title } = req.body;

    if (!documentId) {
      return res.status(404).json({
        success: false,
        error: "Veuillez fournir l’identifiant du document",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(400).json({
        success: false,
        error: "Document introuvable ou pas encore prêt",
        statusCode: 404,
      });
    }

    // Générer un quiz avec Gemini
    const questions = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(numQuestions),
    );

    // Enregistrer dans la base de données
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    await createNotification({
      user: req.user._id,
      title: "Quiz créé",
      message: `Le quiz « ${quiz.title} » a été généré avec succès.`,
      type: "quiz",
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz généré avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Générer le résumé du document
// @route    POST /api/ai/generate-summary
// @access  Privée
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir l’identifiant du document",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document introuvable ou pas encore prêt",
        statusCode: 404,
      });
    }

    // Générer le résumé avec Gemini
    const summary = await geminiService.generateSummary(document.extractedText);

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary,
      },
      message: "Résumé généré avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Discuter avec le document
// @route    POST /api/ai/Chat
// @access  Privée
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir l’identifiant du document et la question",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document introuvable ou pas encore prêt",
        statusCode: 404,
      });
    }

    // Rechercher les segments pertinents
    const relevantChunks = findRelevantChunks(document.chunks, question, 3);
    const chunksIndices = relevantChunks.map((c) => c.chunkIndex);

    // Récupérer ou créer l’historique de discussion
    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: [],
      });
    }

    // Générer la réponse avec Gemini
    const answer = await geminiService.chatWithContext(
      question,
      relevantChunks,
    );

    // Enregistrer la conversation
    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunksIndices,
      },
    );

    await chatHistory.save();

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunksIndices,
        chatHistoryId: chatHistory._id,
      },
      message: "Réponse générée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Expliquer un concept du document
// @route    POST /api/ai/explain-concept
// @access  Privée
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir l’identifiant du document et le concept",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document introuvable ou pas encore prêt",
        statusCode: 404,
      });
    }

    // Rechercher les segments pertinents for the concept
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    const context = relevantChunks.map((c) => c.content).join("\n\n");

    // Générer l’explication avec Gemini
    const explanation = await geminiService.explainConcept(concept, context);

    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: "Explication générée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Récupérer l’historique de discussion d’un document
// @route    GET /api/ai/chat-history/:documentId
// @access  Privée
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir l’identifiant du document",
        statusCode: 400,
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: documentId,
    }).select("messages"); // Récupérer uniquement le tableau des messages

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [], // Retourner un tableau vide si aucun historique de discussion n’est trouvé
        message: "Aucun historique de discussion pour ce document",
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: "Historique de discussion récupéré avec succès",
    });
  } catch (error) {
    next(error);
  }
};
