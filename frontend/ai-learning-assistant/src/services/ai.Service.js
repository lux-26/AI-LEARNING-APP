import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      { documentId, ...options },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de la génération des fiches" };
  }
};

const generateQuiz = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
      documentId,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de la génération du quiz" };
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
      documentId,
    });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de la génération du résumé" };
  }
};

const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      question: message,
    }); // Historique retiré de la charge utile
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de la demande de discussion" };
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
      documentId,
      concept,
    });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de l’explication du concept" };
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec du chargement de l’historique de discussion" };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};

export default aiService;
