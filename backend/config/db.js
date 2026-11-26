import mongoose from "mongoose";

// Fonction asynchrone pour établir la connexion avec MongoDB
const connectDB = async () => {
  try {
    // Tentative de connexion en utilisant l'URI stockée dans les variables d'environnement
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Message de succès affichant l'hôte de la base de données connectée
    console.log(
      `Alhamdou lillah ! MongoDB Connected: ${conn.connection.host} `,
    );
  } catch (error) {
    // En cas d'échec, affichage de l'erreur dans la console
    console.error(`Error Connecting to MongoDB: ${error.message}`);

    // Arrêt immédiat du processus Node.js avec un code d'échec (1) pour éviter de tourner dans le vide
    process.exit(1);
  }
};

export default connectDB;
