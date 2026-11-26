import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    // Référence vers l'utilisateur qui passe le quiz
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Référence vers le document source associé au quiz
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    // Titre ou sujet du quiz
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Tableau des questions du quiz
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        // Options de réponse (le validateur s'assure qu'il y a exactement 4 choix)
        options: {
          type: [String],
          required: true,
          validate: [
            (array) => array.length === 4,
            "La question doit comporter exactement 4 options",
          ],
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String, // Correction : 'tyype' corrigé en 'type'
          default: "",
        },
        // Niveau de difficulté de la question
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],
    // Historique des réponses fournies par l'utilisateur
    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Score final obtenu par l'utilisateur
    score: {
      type: Number,
      default: 0,
    },
    // Nombre total de questions dans le quiz
    totalQuestions: {
      type: Number,
      required: true,
    },
    // Date de fin du quiz (null si non terminé)
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Correction : 'Timestamps' avec un 'T' majuscule changé en minuscule 'timestamps'
  },
);

// Index composé pour optimiser les performances des requêtes filtrant par utilisateur et document
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
