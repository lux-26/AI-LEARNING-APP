import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Fonction utilitaire pour générer un jeton JWT avec une durée de validité
const GenerateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/register
// @accesss  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Vérifie si un utilisateur existe déjà avec cet email ou ce nom d'utilisateur
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error:
          userExists.email === email
            ? "Cette adresse e-mail est déjà enregistrée"
            : "Ce nom d'utilisateur est déjà utilisé",
        statusCode: 400,
      });
    }

    // Création de l'utilisateur en base de données
    const user = await User.create({
      username,
      email,
      password,
    });

    // Génération du token JWT pour l'authentification immédiate
    const token = GenerateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "Utilisateur enregistré avec succès", // Correction de « successufully »
    });
  } catch (error) {
    next(error); // Transmission de l'erreur au middleware global
  }
};

// @desc    Connecter un utilisateur existant
// @route   POST /api/auth/login
// @accesss  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation basique des champs requis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir un e-mail et un mot de passe",
        statusCode: 400,
      });
    }

    // Recherche de l'utilisateur par email (en incluant explicitement le mot de passe masqué par défaut)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Identifiants invalides",
        statusCode: 401,
      });
    }

    // Vérification de la correspondance du mot de passe
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Identifiants invalides",
        statusCode: 401,
      });
    }

    // Génération du token JWT
    const token = GenerateToken(user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
      message: "Connexion réussie",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/auth/profile
// @access  Privée (nécessite d'être connecté via le middleware 'protect')
export const getProfile = async (req, res, next) => {
  try {
    // req.user._id est injecté par le middleware 'protect'
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/auth/profile
// @access  Privée
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    // Mise à jour conditionnelle des champs modifiés
    if (username) user.username = username;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      message: "Profil mis à jour avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modifier le mot de passe de l'utilisateur
// @route   POST /api/auth/change-password
// @access  Privée
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir le mot de passe actuel et le nouveau mot de passe",
        statusCode: 400,
      });
    }

    // Récupération de l'utilisateur avec son mot de passe actuel
    const user = await User.findById(req.user._id).select("+password");

    // Vérification du mot de passe actuel
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Le mot de passe actuel est incorrect",
        statusCode: 401,
      });
    }

    // Assignation du nouveau mot de passe (le hachage se fera automatiquement via le pre-save du modèle User)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    next(error);
  }
};
