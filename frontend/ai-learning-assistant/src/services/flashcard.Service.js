import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec du chargement des ensembles de fiches" };
  }
};

const getFlashcardsForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec du chargement de la fiche" };
  }
};

const reviewFlashcard = async (cardId, cardIndex) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId),
      { cardIndex },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de la révision de la fiche" };
  }
};

const toggleStar = async (cardId) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de l’ajout de la fiche aux favoris" };
  }
};

const deleteFlashcardSet = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Échec de la suppression de la fiche" };
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getFlashcardsForDocument,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
};

export default flashcardService;
