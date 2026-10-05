/**
 * Découpe un texte en morceaux (chunks) de taille cible pour un meilleur traitement par l'IA.
 * @param {string} text - Le texte complet à découper
 * @param {number} chunkSize - La taille cible par morceau (en nombre de mots)
 * @param {number} overlap - Le nombre de mots qui se chevauchent entre deux morceaux consécutifs
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  // 1. Vérification de sécurité : si le texte est vide ou absent, on retourne un tableau vide
  if (!text || text.trim().length === 0) {
    return [];
  }

  // 2. Nettoyage du texte tout en préservant la structure des paragraphes
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();

  // 3. Découpage du texte en paragraphes basés sur les retours à la ligne
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  // S'assurer que overlap est inférieur à chunkSize pour éviter les boucles infinies
  const safeOverlap = Math.min(overlap, chunkSize - 1);
  const step = chunkSize - safeOverlap;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // 4. Si un seul paragraphe dépasse la taille maximale autorisée (chunkSize)
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Découpage du grand paragraphe en sous-morceaux de mots
      for (let i = 0; i < paragraphWords.length; i += step) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize); // Utilisation de slice au lieu de splice
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
      }
      continue;
    }

    // 5. Si l'ajout de ce paragraphe dépasse la taille du chunk, on sauvegarde le chunk actuel
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Gestion du chevauchement (overlap) avec les derniers mots du chunk précédent
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapWords = prevWords.slice(-safeOverlap); // Utilisation de slice pour extraire la fin du tableau
      const overlapText = overlapWords.join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapWords.length + paragraphWordCount;
    } else {
      // 6. Sinon, on ajoute simplement le paragraphe au chunk en cours
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // 7. Ajout du dernier chunk s'il reste des éléments
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex,
      pageNumber: 0,
    });
  }

  // 8. Solution de secours (solution de secours) si aucun chunk n'a été créé
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += step) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });
    }
  }

  return chunks;
};

/**
 * Find relevant chunk based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */

export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  // Mots vides courants à exclure
  const stopWods = new Set([
    "the",
    "is",
    "at",
    "whith",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
  ]);

  //Extraire et nettoyer les mots de la requête
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWods.has(w));

  if (queryWords.length === 0) {
    // Retourner des objets de segment propres, sans métadonnées Mongoose
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    // Attribuer un score à chaque mot de la requête
    for (const word of queryWords) {
      // Correspondance exacte du mot (score supérieur)
      const exactMatches = (
        content.match(new RegExp(`\\b${word}\\b`, "g")) || []
      ).length;
      score += exactMatches * 3;

      // Correspondance partielle (score inférieur)
      const partialMatches = (content.match(new RegExp(word, "g")) || [])
        .length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // Bonus : plusieurs mots de la requête trouvés
    const uniqueWordsFound = queryWords.filter((word) =>
      content.includes(word),
    ).length;
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    // Normaliser selon la longueur du contenu
    const normalizedScore = score / Math.sqrt(contentWords);

    // Petit bonus pour les segments précédents
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    // Retourner un objet propre, sans métadonnées Mongoose
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound,
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};
