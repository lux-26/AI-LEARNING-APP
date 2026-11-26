import express from "express";
import { body, validationResult } from "express-validator"; // Ajout de validationResult pour faire fonctionner le middleware validate
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/auth.Controller.js";
import protect from "../middleware/auth.js";

// Initialisation du routeur Express
const router = express.Router();

// Middleware personnalisé pour intercepter et formater les erreurs de validation d'express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors
        .array()
        .map((err) => err.msg)
        .join(", "), // Fusionne tous les messages d'erreur en une seule chaîne de caractères
      statusCode: 400,
    });
  }
  next(); // Si aucune erreur, on passe au contrôleur suivant
};

// Règles de validation pour l'inscription d'un nouvel utilisateur
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Veuillez fournir une adresse e-mail valide"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit comporter au moins 6 caractères"),
];

// Règles de validation pour la connexion
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Veuillez fournir une adresse e-mail valide"),
  body("password").notEmpty().withMessage("Le mot de passe est obligatoire"),
];

// Routes publiques (le middleware 'validate' est inséré entre les règles et le contrôleur pour bloquer les données invalides)
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

// Routes protégées (nécessitent un jeton JWT valide grâce au middleware 'protect')
router.get("/profile", protect, getProfile); // Récupérer le profil de l'utilisateur connecté
router.put("/profile", protect, updateProfile); // Mettre à jour les informations du profil
router.post("/change-password", protect, changePassword); // Modifier son mot de passe

export default router;
