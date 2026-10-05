import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    // Référence vers l'utilisateur propriétaire des flashcards
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Référence vers le document source (Correction de « docummentId » et de la syntaxe du type)
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    // Tableau contenant les cartes mémoires (recto/verso)
    cards: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
        lastReviewed: {
          type: Date,
          default: null,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true, // Ajoute automatiquement les dates de création et de mise à jour
  },
);

// Index composé pour optimiser les recherches par utilisateur et par document
flashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;
