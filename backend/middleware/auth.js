import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware pour protéger les routes et vérifier l'authentification par JWT
const protect = async (req, res, next) => {
  let token;

  // Vérifie si l'en-tête "Authorization" existe et commence par "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extrait le token du header (en séparant "Bearer" et la chaîne du token)
      token = req.headers.authorization.split(" ")[1];

      // Vérification et décodage du token à l'aide de la clé secrète JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupère l'utilisateur correspondant dans la base de données en excluant son mot de passe
      req.user = await User.findById(decoded.id).select("-password");

      // Si l'utilisateur n'existe plus en base de données
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "user not found",
          statusCode: 401,
        });
      }

      // Tout est valide, on passe au contrôleur suivant
      next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);

      // Gestion spécifique si le token a expiré
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Le jeton a expiré",
          statusCode: 401,
        });
      }

      // Gestion des autres erreurs de vérification du token (ex: signature invalide)
      return res.status(401).json({
        success: false,
        error: "Accès non autorisé : échec du jeton",
        statusCode: 401,
      });
    }
  }

  // Si aucun token n'a été trouvé dans les en-têtes de la requête
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Accès non autorisé : aucun jeton fourni",
      statusCode: 401,
    });
  }
};

export default protect;
