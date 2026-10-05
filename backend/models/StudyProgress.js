import mongoose from "mongoose";

const studyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    summaryViewed: {
      type: Boolean,
      default: false,
    },
    chatInteractions: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    flashcardsReviewed: {
      type: Number,
      default: 0,
      min: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

studyProgressSchema.index({ userId: 1, documentId: 1 }, { unique: true });

const StudyProgress = mongoose.model("StudyProgress", studyProgressSchema);

export default StudyProgress;
