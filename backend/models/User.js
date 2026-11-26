import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Définition du schéma Mongoose pour l'utilisateur
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Veuillez fournir un nom d'utilisateur"],
      unique: true,
      trim: true, // Supprime les espaces inutiles au début et à la fin
      minlength: [3, "Le nom d'utilisateur doit comporter au moins 3 caractères"],
    },
    email: {
      type: String,
      required: [true, "Veuillez fournir une adresse e-mail"],
      unique: true,
      lowercase: true, // Convertit automatiquement l'email en minuscules
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir une adresse e-mail valide"], // Expression régulière pour valider le format de l'email
    },
    password: {
      type: String,
      required: [true, "Veuillez fournir un mot de passe"],
      minlength: [6, "Le mot de passe doit comporter au moins 6 caractères"],
      select: false, // Empêche de renvoyer le mot de passe par défaut lors des requêtes de recherche (find)
    },
    profileImage: {
      type: String,
      default: null, // Valeur nulle par défaut si l'utilisateur n'a pas de photo de profil
    },
    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    badges: {
      type: [String],
      default: [],
    },
    dailyGoal: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement les champs createdAt et updatedAt
  },
);

// Middleware Mongoose (pre-save) : Hachage automatique du mot de passe avant l'enregistrement en base de données
userSchema.pre("save", async function () {
  // Si le mot de passe n'a pas été modifié (ex: mise à jour du profil sans toucher au mot de passe), on passe au suivant
  if (!this.isModified("password")) {
    return;
  }

  // Génération d'un "salt" (sel) et hachage sécurisé du mot de passe avec bcryptjs
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Indique à Mongoose de poursuivre l'enregistrement
});

// Méthode d'instance pour comparer le mot de passe entré par l'utilisateur avec le mot de passe haché en base
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Création et exportation du modèle User basé sur le schéma
const User = mongoose.model("User", userSchema);

export default User;
