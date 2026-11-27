import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware pour protéger les routes et vérifier l'authentification par JWT
const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const bearerMatch =
    typeof authorization === "string"
      ? authorization.match(/^Bearer\s+(\S+)$/i)
      : null;

  if (!bearerMatch) {
    return res.status(401).json({
      success: false,
      error: authorization
        ? "En-tête Authorization invalide : format Bearer attendu"
        : "Accès non autorisé : aucun jeton fourni",
      statusCode: 401,
    });
  }

  try {
    // Vérification et décodage du token à l'aide de la clé secrète JWT
    const decoded = jwt.verify(bearerMatch[1], process.env.JWT_SECRET);

    // Récupère l'utilisateur correspondant dans la base de données sans son mot de passe
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Utilisateur introuvable",
        statusCode: 401,
      });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Le jeton a expiré",
        statusCode: 401,
      });
    }

    return res.status(401).json({
      success: false,
      error: "Accès non autorisé : échec du jeton",
      statusCode: 401,
    });
  }
};

export default protect;
