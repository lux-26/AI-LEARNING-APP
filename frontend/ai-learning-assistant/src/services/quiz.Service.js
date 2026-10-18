import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const getQuizzesForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec du chargement des quiz" };
  }
};

const getAllQuizzes = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_ALL_QUIZZES);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec du chargement des quiz" };
  }
};

const getQuizById = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec du chargement du quiz" };
  }
};

const submitQuiz = async (quizId, answers) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId),
      { answers },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de l’envoi du quiz" };
  }
};

const getQuizResults = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec du chargement des résultats du quiz" };
  }
};

const deleteQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.QUIZZES.DELETE_QUIZ(quizId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de la suppression du quiz" };
  }
};

const quizService = {
  getAllQuizzes,
  getQuizzesForDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};

export default quizService;
