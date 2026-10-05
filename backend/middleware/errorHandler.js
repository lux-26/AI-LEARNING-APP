const errorHandler = (err, req, res, next) => {
  // Détermination du code de statut HTTP (par défaut 500 si non spécifié)
  let statusCode = err.statusCode || 500;
  // Message d'erreur par défaut
  let message = err.message || "Erreur serveur";

  // Gestion des erreurs Mongoose : ID invalide (CastError)
  if (err.name === "CastError") {
    message = "Ressource introuvable";
    statusCode = 400;
  }

  // Gestion des erreurs Mongoose : Doublon de clé unique (ex: email ou username déjà pris)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  // Gestion des erreurs Mongoose : Erreur de validation des champs requis/format
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(",");
    statusCode = 400;
  }

  // Gestion des erreurs Multer : Dépassement de la taille limite du fichier
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "La taille du fichier dépasse la limite maximale de 10 Mo";
    statusCode = 400;
  }

  // Gestion des erreurs liées aux jetons JWT : Jeton invalide (corrigé de 'Invaled' à 'Invalid')
  if (err.name === "JsonWebTokenError") {
    message = "Jeton invalide";
    statusCode = 401;
  }

  // Gestion des erreurs liées aux jetons JWT : Jeton expiré
  if (err.name === "TokenExpiredError") {
    message = "Jeton expiré";
    statusCode = 401;
  }

  // Affichage de la pile d'erreurs (stack trace) dans la console uniquement en mode développement
  console.error("Erreur :", {
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Envoi de la réponse JSON standardisée d'erreur au client
  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    // Ajoute la propriété 'stack' dans la réponse uniquement si l'on est en mode développement
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
