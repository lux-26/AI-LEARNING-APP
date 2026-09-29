import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extrait le texte d'un fichier PDF
 * @param {string} filePath - Chemin vers le fichier PDF
 * @returns {Promise<{text: string, numPages: number, info: Object}>}
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    // 1. Lit le fichier PDF sur le disque sous forme de tampon (Buffer) de manière asynchrone
    const dataBuffer = await fs.readFile(filePath);

    // pdf-parsse expects a Uint8Array, not a Buffer
    const parser = new PDFParse(new Uint8Array(dataBuffer));

    // 2. Passe le tampon à la bibliothèque pdf-parse pour extraire les données du document
    const data = await await parser.getText();

    // 3. Retourne un objet propre contenant le texte, le nombre de pages et les métadonnées du fichier
    return {
      text: data.text,
      numPages: data.numpages, // 'numpages' s'écrit en minuscules dans le retour standard de pdf-parse
      info: data.info,
    };
  } catch (error) {
    // 4. Capture l'erreur si le fichier est introuvable, illisible ou corrompu
    console.error("Erreur lors de l'analyse du PDF :", error);
    throw new Error("Impossible d'extraire le texte du PDF");
  }
};
