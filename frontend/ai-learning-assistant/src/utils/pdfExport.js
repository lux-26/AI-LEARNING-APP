import jsPDF from "jspdf";

const PAGE_HEIGHT = 280;
const LEFT_MARGIN = 15;
const CONTENT_WIDTH = 180;

const addWrappedText = (pdf, text, y, options = {}) => {
  const { fontSize = 11, lineHeight = 6, fontStyle = "normal" } = options;
  pdf.setFontSize(fontSize);
  pdf.setFont("helvetica", fontStyle);

  const lines = pdf.splitTextToSize(String(text || ""), CONTENT_WIDTH);
  lines.forEach((line) => {
    if (y > PAGE_HEIGHT) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(line, LEFT_MARGIN, y);
    y += lineHeight;
  });

  return y;
};

export const exportSummaryPdf = ({ title, content }) => {
  const pdf = new jsPDF();
  let y = 20;

  y = addWrappedText(pdf, title || "Résumé", y, {
    fontSize: 16,
    lineHeight: 8,
    fontStyle: "bold",
  });
  y += 8;
  addWrappedText(
    pdf,
    String(content || "")
      .replace(/[#*_>`~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
    y,
  );
  pdf.save(`${(title || "resume").replace(/[^\w-]+/g, "-")}.pdf`);
};

export const exportQuizResultsPdf = ({ title, score, results }) => {
  const pdf = new jsPDF();
  let y = 20;

  y = addWrappedText(pdf, title || "Résultats du quiz", y, {
    fontSize: 16,
    lineHeight: 8,
    fontStyle: "bold",
  });
  y = addWrappedText(pdf, `Score : ${score}%`, y + 6, {
    fontSize: 13,
    lineHeight: 7,
    fontStyle: "bold",
  });
  y += 6;

  results.forEach((result, index) => {
    y = addWrappedText(pdf, `Question ${index + 1} : ${result.question}`, y, {
      fontStyle: "bold",
    });
    y = addWrappedText(pdf, `Votre réponse : ${result.selectedAnswer || "Aucune"}`, y);
    y = addWrappedText(pdf, `Bonne réponse : ${result.correctAnswer}`, y);
    y += 4;
  });

  pdf.save(`${(title || "resultats-quiz").replace(/[^\w-]+/g, "-")}.pdf`);
};

export const exportFlashcardsPdf = ({ title, cards }) => {
  const pdf = new jsPDF();
  let y = 20;

  y = addWrappedText(pdf, title || "Flashcards", y, {
    fontSize: 16,
    lineHeight: 8,
    fontStyle: "bold",
  });
  y += 8;

  cards.forEach((card, index) => {
    y = addWrappedText(pdf, `${index + 1}. ${card.question}`, y, {
      fontStyle: "bold",
    });
    y = addWrappedText(pdf, `Réponse : ${card.answer}`, y);
    y += 4;
  });

  pdf.save(`${(title || "flashcards").replace(/[^\w-]+/g, "-")}.pdf`);
};
