import mongoose from "mongoose";

// Définition du schéma Mongoose pour l'historique des discussions liées à un document
const chatHistorySchema = new mongoose.Schema(
  {
    // Référence vers l'utilisateur qui discute
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Référence vers le document sur lequel porte la conversation
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    // Tableau contenant l'historique des messages échangés
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"], // L'auteur du message est soit l'utilisateur, soit l'IA
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        // Index des segments (chunks) du document pertinents pour ce message
        relevantChunks: {
          type: [Number],
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true, // Ajoute automatiquement les dates de création et de mise à jour
  },
);

// Index composé pour optimiser les requêtes de recherche par utilisateur et par document
chatHistorySchema.index({ userId: 1, documentId: 1 });

// Par convention, le nom de la variable du modèle commence par une majuscule
const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;
