import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import StudyProgress from "../models/StudyProgress.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";

// @desc   upload PDF document
// @route   POST /api/doucements/upload
// @access  Private

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    if (!title) {
      // Delete uploaded file if no title privide
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    // Store only the generated filename; build public URLs separately when needed.
    const storedFileName = req.file.filename;

    // Create document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: storedFileName,
      fileSize: req.file.size,
      status: "processing",
    });

    // Process PDF in background (in production, use a queue like Bull)
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("PDF processing error:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
  try {
    // Stop early if the document was deleted before processing started.
    const existingDocument = await Document.exists({ _id: documentId });
    if (!existingDocument) return;

    const { text } = await extractTextFromPDF(filePath);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // updateOne does not recreate a document that was deleted during processing.
    const updateResult = await Document.updateOne(
      { _id: documentId },
      {
        extractedText: text,
        chunks,
        status: "ready",
      },
    );

    if (updateResult.matchedCount === 0) return;

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    // A concurrent deletion is an expected outcome, not a processing failure.
    const existingDocument = await Document.exists({ _id: documentId }).catch(() => null);
    if (!existingDocument) return;

    console.error(`Error processing document ${documentId}:`, error);
    await Document.updateOne(
      { _id: documentId },
      { status: "fail" },
    ).catch((updateError) => {
      console.error(`Could not update document ${documentId} status:`, updateError);
    });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access   Private
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
        $sort: { UploadDate: -1 },
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

// @desc    Get single document with chunks
// @route   GET /api/documents/:id
// @access   Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Get counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    //Update last accessed
    document.lastAccessed = Date.now();
    await document.save();

    // Combine document data with counts
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

// @desc    Delete document with chunks
// @route   DELETE /api/documents/:id
// @access   Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Remove only this user's study data linked to this document.
    // allSettled waits for every cleanup operation before reporting a failure.
    const cleanupResults = await Promise.allSettled([
      Flashcard.deleteMany({
        documentId: document._id,
        userId: req.user._id,
      }),
      Quiz.deleteMany({
        documentId: document._id,
        userId: req.user._id,
      }),
      StudyProgress.deleteMany({
        documentId: document._id,
        userId: req.user._id,
      }),
    ]);

    const cleanupFailure = cleanupResults.find(
      (result) => result.status === "rejected",
    );
    if (cleanupFailure) {
      throw cleanupFailure.reason;
    }

    // Delete the document only after all related cleanup operations have settled successfully.
    await document.deleteOne();

    // Delete the uploaded file safely, supporting new filenames and legacy URL records.
    // A missing/unavailable local file must not prevent the database deletion from succeeding.
    const storedFileName = path.basename(document.filePath || "");
    if (storedFileName) {
      const filePath = path.join(process.cwd(), "uploads", "documents", storedFileName);
      await fs.unlink(filePath).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get study progress for a document
// @route   GET /api/documents/:id/progress
// @access  Private
export const getDocumentProgress = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select("_id");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const progress = await StudyProgress.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    res.status(200).json({
      success: true,
      data: progress || { userId: req.user._id, documentId: document._id, progress: 0 },
    });
  } catch (error) {
    next(error);
  }
};
