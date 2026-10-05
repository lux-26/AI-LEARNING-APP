import Flashcard from "../models/Flashcard.js";

// @desc     Récupérer toutes les fiches d’un document
// @route     GET  /api/flashcards/:documentId
// @access     Privée

export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      date: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Récupérer tous les ensembles de fiches d’un utilisateur
// @route     GET  /api/flashcards
// @access     Privée
export const getAllFlashcardSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({
      userId: req.user._id,
    })
      .populate("documentId", "title")
      .sort({ createdAt: -1});

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Marquer une fiche comme révisée
// @route  POST /api/flashcards/:cardId/review
// @access  Privée
export const reviewFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Ensemble de fiches ou fiche introuvable",
        statusCode: 404,
      });
    }
    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.cardId,
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Fiche introuvable dans l’ensemble",
        statusCode: 404,
      });
    }

    // Mettre à jour les informations de révision
    flashcardSet.cards[cardIndex].lastReviewed = new Date();
    flashcardSet.cards[cardIndex].reviewCount += 1;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: "Fiche révisée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Activer ou désactiver le favori d’une fiche
// @route    PUT /api/flashcards/:cardId/star
// @accesss   privée
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Ensemble de fiches ou fiche introuvable",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.cardId,
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Fiche introuvable dans l’ensemble",
        statusCode: 404,
      });
    }

    // Activer ou désactiver le favori
    flashcardSet.cards[cardIndex].isStarred =
      !flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      messsage: `Fiche ${flashcardSet.cards[cardIndex].isStarred ? "ajoutée aux favoris" : "retirée des favoris"}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Supprimer un ensemble de fiches
// @route   DELETE /api/flashcards/:id
// @access  Privée
export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: flase,
        error: "Ensemble de fiches introuvable",
        statusCode: 404,
      });
    }

    await flashcardSet.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Ensemble de fiches supprimé avec succès'
    })
  } catch (error) {
    next(error);
  }
};
