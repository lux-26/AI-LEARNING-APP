const errorHandler = (err, req, res, next) => {
  // Laisser Express gérer la réponse si les en-têtes ont déjà été envoyés.
  if (res.headersSent) {
    return next(err);
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  let statusCode = Number(err.statusCode) || 500;
  let message = err.message || "Erreur serveur";

  // Éviter les codes HTTP invalides ou hors de la plage des erreurs.
  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  // Erreurs Mongoose : identifiant invalide.
  if (err.name === "CastError") {
    message = "Ressource introuvable";
    statusCode = 400;
  }

  // Erreurs Mongoose : doublon sur un champ unique.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Une valeur existe déjà";
    statusCode = 400;
  }

  // Erreurs Mongoose : validation des champs.
  if (err.name === "ValidationError") {
    message = Object.values(err.errors || {})
      .map((value) => value.message)
      .filter(Boolean)
      .join(",") || "Données invalides";
    statusCode = 400;
  }

  // Erreurs Multer : dépassement de la taille maximale du fichier.
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "La taille du fichier dépasse la limite maximale de 10 Mo";
    statusCode = 400;
  }

  // Erreurs JWT.
  if (err.name === "JsonWebTokenError") {
    message = "Jeton invalide";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Jeton expiré";
    statusCode = 401;
  }

  // Les détails techniques restent dans les journaux du serveur.
  console.error("Erreur API :", {
    name: err.name,
    message: err.message,
    method: req.method,
    path: req.originalUrl,
    stack: err.stack,
  });

  // En production, ne jamais transmettre le détail d'une erreur 5xx au client.
  const responseMessage =
    statusCode >= 500 && !isDevelopment
      ? "Une erreur interne est survenue."
      : message;

  res.status(statusCode).json({
    success: false,
    error: responseMessage,
    statusCode,
    ...(isDevelopment && { stack: err.stack }),
  });
};

export default errorHandler;
