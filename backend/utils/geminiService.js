import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "ERREUR FATALE : GEMINI_API_KEY n’est pas définie dans les variables d’environnement.",
  );
  process.exit(1);
}

/**
 * Générer des fiches à partir d’un texte
 * @param {string} text - Texte du document
 * @param {number} count - Nombre de fiches à générer
 * @param {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */

export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Génère exactement ${count} fiches pédagogiques en français à partir du texte suivant.
  Les questions, les réponses et les explications doivent être entièrement rédigées en français.
  Format de chaque fiche :
  Q: [Question claire et précise en français]
  A: [Réponse concise et exacte en français]
  D: [Niveau de difficulté : easy, medium ou hard]
  
  Separate each flashcard with "---"
  
  Texte :
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    //Analyser la réponse
    const flashcards = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Échec de la génération des fiches");
  }
};

/**
 * Générer des questions de quiz
 * @param {string} text - Texte du document
 * @param {number} numQuestions - Nombre de questions
 * @return {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Génère exactement ${numQuestions} questions à choix multiple en français à partir du texte suivant.
  Les questions, les options et les explications doivent être entièrement rédigées en français.
  Format de chaque question :
  Q: [Question claire et précise en français]
  O1: [Option 1 en français]
  O2: [Option 2 en français]
  O3: [Option 3 en français]
  O4: [Option 4 en français]
  C: [Bonne réponse, exactement comme écrite ci-dessus]
  E: [Brève explication en français]
  D: [Niveau de difficulté : easy, medium ou hard]
  
  Separate questions with "---"
  
  Texte :
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    const questions = [];
    const questionBlocks = generatedText.split("---").filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^O\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("gemini API error:", error);
    throw new Error("Échec de la génération du quiz");
  }
};

/**
 * @param {string} text - Texte du document
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `Rédige un résumé concis en français du texte suivant, en mettant en évidence les concepts clés, les idées principales et les points importants.
  Le résumé doit être clair et structuré.

  Texte :
  ${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Échec de la génération du résumé");
  }
};

/**
 * Discuter avec le contexte du document
 * @param {string} question - Question de l’utilisateur
 * @param {Array<Object>} chunks - Segments pertinents du document
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `À partir du contexte suivant extrait d’un document, analyse le contexte et réponds à la question de l’utilisateur en français.
  Si la réponse ne figure pas dans le contexte, indique-le.
  
  Contexte :
  ${context}
  
  Question : ${question}
  
  Réponse :`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Erreur de l’API Gemini :", error);
    throw new Error("Échec du traitement de la demande de discussion");
  }
};

/**
 * Expliquer un concept précis
 * @param {string} concept - Concept à expliquer
 * @param {string} context - Contexte pertinent
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explique le concept de "${concept}" à partir du contexte suivant.
  Fournis une explication claire et pédagogique, facile à comprendre.
  Ajoute un exemple si cela est pertinent.
  
  Contexte :
  ${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Échec de l’explication du concept");
  }
};
