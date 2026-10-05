import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { createNotification } from "../utils/notificationService.js";

// @desc   importer un document PDF
// @route   POST /api/documents/upload
// @access  Privée

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Veuillez importer un fichier PDF",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    if (!title) {
      // Supprimer le fichier importé si aucun titre n’est fourni
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Veuillez saisir un titre de document",
        statusCode: 400,
      });
    }

    // Construire l’URL du fichier importé
    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // Créer l’enregistrement du document
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
    });

    await createNotification({
      user: req.user._id,
      title: "Document importé",
      message: `Le document « ${title} » a été importé avec succès.`,
      type: "document",
    });

    // Traiter le PDF en arrière-plan (en production, utiliser une file comme Bull)
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("PDF processing error:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document importé avec succès. Traitement en cours...",
    });
  } catch (error) {
    // Nettoyer le fichier en cas d’erreur
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// Fonction utilitaire pour traiter le PDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    // Créere chunks
    const chunks = chunkText(text, 500, 50);

    //Mettre à jour le document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc    Récupérer tous les documents de l’utilisateur
// @route   GET /api/documents
// @access  Privée
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer un document avec ses segments
// @route   GET /api/documents/:id
// @access  Privée
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document introuvable",
        statusCode: 404,
      });
    }

    // Récupérer le nombre de fiches et de quiz associés
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    //Mettre à jour la dernière consultation
    document.lastAccessed = Date.now();
    await document.save();

    // Combiner les données du document avec les compteurs
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer le document et ses segments
// @route   DELETE /api/documents/:id
// @access  Privée
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document introuvable",
        statusCode: 404,
      });
    }

    // Supprimer le fichier du système de fichiers
    await fs.unlink(document.filePath).catch(() => {});

    // Supprimer document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};
