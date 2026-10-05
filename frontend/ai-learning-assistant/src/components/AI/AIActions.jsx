import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  Play,
  Pause,
  Download,
} from "lucide-react";
import aiService from "../../services/ai.Service.js";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer.jsx";
import Modal from "../common/Modal.jsx";
import { exportSummaryPdf } from "../../utils/pdfExport.js";

const AIActions = ({ document }) => {
  const { id: documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  const sentencesRef = useRef([]);
  const currentSentenceIndexRef = useRef(0);
  const intentionalStopRef = useRef(false);
  const documentTopic =
    document?.mainTopic ||
    (Array.isArray(document?.suggestedTopics)
      ? document.suggestedTopics[0]
      : null) ||
    (Array.isArray(document?.keywords) ? document.keywords[0] : null);
  const dynamicPlaceholder = documentTopic
    ? `ex. « ${documentTopic} »`
    : document?.title
      ? `ex. « Un concept de ${document.title} »`
      : "Entrez un mot-clé du document...";
  const hasModalActions =
    modalTitle === "Résumé généré" || modalTitle.startsWith("Explication de ");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      stopSpeech();
      setModalTitle("Résumé généré");
      setModalContent(summary);
      setSpeechRate(1);
      setIsModalOpen(true);
    } catch {
      toast.error("Échec de la génération du résumé.");
    } finally {
      setLoadingAction(null);
    }
  };

  const stopSpeech = () => {
    intentionalStopRef.current = true;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
    sentencesRef.current = [];
    currentSentenceIndexRef.current = 0;
  };

  const getSpeechText = (content) =>
    content
      .replace(/```[\w-]*\n?/g, "")
      .replace(/\\rightarrow/g, " vers ")
      .replace(/[$#*_>`~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

  const playCurrentSentence = () => {
    const sentences = sentencesRef.current;
    const sentence = sentences[currentSentenceIndexRef.current];

    if (!sentence) {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
      return;
    }

    intentionalStopRef.current = false;
    const utterance = new SpeechSynthesisUtterance(sentence);
    utteranceRef.current = utterance;
    utterance.lang = "fr-FR";
    utterance.rate = speechRate;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      if (utteranceRef.current !== utterance) return;
      currentSentenceIndexRef.current += 1;
      playCurrentSentence();
    };
    utterance.onerror = (event) => {
      if (utteranceRef.current !== utterance) return;
      utteranceRef.current = null;
      if (
        intentionalStopRef.current ||
        event.error === "interrupted" ||
        event.error === "canceled"
      ) {
        return;
      }
      setIsSpeaking(false);
      setIsPaused(false);
      toast.error("Échec de la lecture du résumé.");
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("La synthèse vocale n'est pas disponible sur ce navigateur.");
      return;
    }

    if (isPaused) {
      playCurrentSentence();
      return;
    }

    stopSpeech();
    sentencesRef.current = getSpeechText(modalContent)
      .split(/(?<=[.?!])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    currentSentenceIndexRef.current = 0;
    playCurrentSentence();
  };

  const handlePauseSpeech = () => {
    if (
      "speechSynthesis" in window &&
      (window.speechSynthesis.speaking || utteranceRef.current)
    ) {
      intentionalStopRef.current = true;
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsSpeaking(false);
      setIsPaused(true);
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        intentionalStopRef.current = true;
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
      sentencesRef.current = [];
      currentSentenceIndexRef.current = 0;
    };
  }, []);

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error("Veuillez saisir un concept à expliquer.");
      return;
    }
    setLoadingAction("explain");
    try {
      const { explanation } = await aiService.explainConcept(
        documentId,
        concept,
      );
      stopSpeech();
      setModalTitle(`Explication de « ${concept} »`);
      setModalContent(explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch {
      toast.error("Échec de l'explication du concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-purple-500/25 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Assistant IA
              </h3>
              <p className="text-xs text-slate-500">Propulsé par une IA avancée</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Generate Summary */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <BookOpen
                      className="w-4 h-4 text-blue-600"
                      strokeWidth={2}
                    />
                  </div>
                  <h4 className="font-semibold text-slate-900">
                    Générer un résumé
                  </h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Obtenez un résumé concis de l'ensemble du document.
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="shrink-0 h-10 px-5 bg-linear-to-r from-teal-500 to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loadingAction === "summary" ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin" />
                    Chargement...
                  </span>
                ) : (
                  "Résumer"
                )}
              </button>
            </div>
          </div>

          {/* Explain Concept */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <form onSubmit={handleExplainConcept}>
              <div className="flex items-center gap-2 mb-3 ">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Lightbulb
                    className="w-4 h-4 text-amber-600"
                    strokeWidth={2}
                  />
                </div>
                <h4 className="font-semibold text-slate-900">
                  Expliquer un concept
                </h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Entrez un sujet ou un concept du document pour obtenir une explication détaillée.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder={dynamicPlaceholder}
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/10"
                  disabled={loadingAction === "explain"}
                />
                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className="shrink-0 h-11 px-5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {loadingAction === "explain" ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Chargement...
                    </span>
                  ) : (
                    "Expliquer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          stopSpeech();
          setIsModalOpen(false);
        }}
        title={modalTitle}
        headerActions={
          hasModalActions ? (
            <>
              <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={
                    isSpeaking && !isPaused ? handlePauseSpeech : handleSpeak
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                  aria-label={
                    isSpeaking && !isPaused
                      ? "Mettre en pause"
                      : isPaused
                        ? "Reprendre la lecture"
                        : "Lire le résumé"
                  }
                  title={
                    isSpeaking && !isPaused
                      ? "Pause"
                      : isPaused
                        ? "Reprendre"
                        : "Lire"
                  }
                >
                  {isSpeaking && !isPaused ? (
                    <Pause className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Play className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
                <select
                  value={speechRate}
                  onChange={(event) => {
                    stopSpeech();
                    setSpeechRate(Number(event.target.value));
                  }}
                  className="h-8 rounded-lg border-0 bg-transparent px-1 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-0"
                  aria-label="Vitesse de lecture"
                >
                  {[0.75, 1, 1.25, 1.5].map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}x
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportSummaryPdf({ title: modalTitle, content: modalContent })
                }
                className="inline-flex shrink-0 h-11 items-center justify-center gap-2 px-5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 active:scale-95"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                Exporter PDF
              </button>
            </>
          ) : null
        }
      >
        <div className="max-h-[60vh] overflow-y-auto prose prose-sm max-w-none prose-slate ">
          <MarkdownRenderer content={modalContent} />
        </div>
      </Modal>
    </>
  );
};

export default AIActions;
