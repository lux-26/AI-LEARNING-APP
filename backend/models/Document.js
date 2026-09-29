import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    // Référence vers l'utilisateur propriétaire du document (correction de 'userid' en 'userId' par cohérence)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Titre du document
    title: {
      type: String,
      required: [true, "Please provide a document title"], // Correction de 'requiired' en 'required'
      trim: true,
    },
    // Nom original du fichier stocké
    fileName: {
      type: String,
      required: true,
    },
    // Chemin d'accès ou URL du fichier sur le serveur/cloud
    filePath: {
      type: String,
      required: true,
    },
    // Taille du fichier en octets
    fileSize: {
      type: Number,
      required: true,
    },
    // Texte brut extrait du document (utilisé pour la recherche ou l'IA)
    extractedText: {
      type: String,
      default: "",
    },
    // Découpage du texte en segments (chunks) pour les embeddings/IA
    chunks: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    // Date de mise en ligne du document
    UploadDate: {
      type: Date,
      default: Date.now,
    },
    // Date du dernier accès au document
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    // Statut du traitement du document
    status: {
      type: String,
      enum: ["processing", "ready", "fail"],
      default: "processing",
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  },
);

// Index composé pour optimiser les requêtes (correction de 'userid' et 'uplaodDate' pour correspondre aux noms exacts)
documentSchema.index({ userId: 1, UploadDate: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
