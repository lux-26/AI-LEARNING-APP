import express from "express";
import { body, validationResult } from "express-validator";
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

// Middleware personnalisé pour intercepter et formater les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
      statusCode: 400,
    });
  }
  next();
};

// Règles de validation pour l'inscription
const registerValidation = [
  body("username")
    .isString()
    .withMessage("Le nom d'utilisateur doit être une chaîne de caractères")
    .bail()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Le nom d'utilisateur doit comporter entre 3 et 50 caractères"),
  body("email")
    .isEmail()
    .withMessage("Veuillez fournir une adresse e-mail valide")
    .bail()
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("Le mot de passe doit être une chaîne de caractères")
    .bail()
    .isLength({ min: 6, max: 128 })
    .withMessage("Le mot de passe doit comporter entre 6 et 128 caractères"),
];

// Règles de validation pour la connexion
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Veuillez fournir une adresse e-mail valide")
    .bail()
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("Le mot de passe doit être une chaîne de caractères")
    .bail()
    .notEmpty()
    .withMessage("Le mot de passe est obligatoire"),
];

// Règles de validation pour la mise à jour du profil.
// Les champs sont facultatifs, mais au moins un doit être fourni.
const profileValidation = [
  body("username")
    .optional()
    .isString()
    .withMessage("Le nom d'utilisateur doit être une chaîne de caractères")
    .bail()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Le nom d'utilisateur doit comporter entre 3 et 50 caractères"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Veuillez fournir une adresse e-mail valide")
    .bail()
    .normalizeEmail(),
  body("profileImage")
    .optional({ nullable: true })
    .isString()
    .withMessage("L'image de profil doit être une chaîne de caractères")
    .bail()
    .isLength({ max: 2048 })
    .withMessage("L'image de profil ne doit pas dépasser 2 048 caractères"),
  body().custom((value) => {
    if (
      !value ||
      !["username", "email", "profileImage"].some((field) =>
        Object.prototype.hasOwnProperty.call(value, field),
      )
    ) {
      throw new Error("Veuillez fournir au moins un champ à modifier");
    }
    return true;
  }),
];

// Règles de validation pour le changement de mot de passe
const changePasswordValidation = [
  body("currentPassword")
    .isString()
    .withMessage("Le mot de passe actuel doit être une chaîne de caractères")
    .bail()
    .notEmpty()
    .withMessage("Le mot de passe actuel est obligatoire"),
  body("newPassword")
    .isString()
    .withMessage("Le nouveau mot de passe doit être une chaîne de caractères")
    .bail()
    .isLength({ min: 6, max: 128 })
    .withMessage("Le nouveau mot de passe doit comporter entre 6 et 128 caractères"),
];

// Routes publiques
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

// Routes protégées
router.get("/profile", protect, getProfile);
router.put("/profile", protect, profileValidation, validate, updateProfile);
router.post(
  "/change-password",
  protect,
  changePasswordValidation,
  validate,
  changePassword,
);

export default router;
