import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.Routes.js";
import documentRoutes from "./routes/document.Routes.js";
import flashcardRoutes from "./routes/flashcard.Routes.js";
import aiRoutes from "./routes/ai.Routes.js";
import quizRoutes from "./routes/quiz.Routes.js";
import progressRoutes from "./routes/progress.Routes.js";
import notificationRoutes from "./routes/notification.Routes.js";

// Configuration de __dirname pour les modules ES6 (car __dirname n'existe pas nativement en ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialisation de l'application Express
const app = express();

// Connexion à la base de données MongoDB
connectDB();

// Middleware CORS pour autoriser les requêtes cross-origin (depuis un frontend React, Postman, etc.)
app.use(
  cors({
    origin: "*", // Autorise toutes les origines (à restreindre en production si besoin)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Méthodes HTTP autorisées
    allowedHeaders: ["Content-Type", "Authorization"], // En-têtes autorisés (notamment pour le token JWT)
    credentials: true,
  }),
);

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Middleware pour parser les données URL-encoded (formulaires HTML)
app.use(express.urlencoded({ extended: true }));

// Dossier statique pour rendre les fichiers uploadés accessibles publiquement via URL (ex: /uploads/mon-image.jpg)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enregistrement des routes d'authentification sous le préfixe /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notifications", notificationRoutes);

// Middleware de gestion pour les routes introuvables (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    statusCode: 404,
  });
});

// Middleware global de gestion des erreurs (doit toujours être placé en dernier après les routes)
app.use(errorHandler);

// Démarrage du serveur sur le port défini dans le fichier .env ou par défaut sur le port 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(
    `Alhamdou lillah ! Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Gestion de la sécurité : Arrêt propre du serveur en cas d'erreur de promesse non interceptée (unhandled rejection)
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  // Fermeture du serveur avec un code d'erreur (1) pour éviter un état instable
  process.exit(1);
});
