import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/ai.Service.js";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer.jsx";
import Modal from "../common/Modal.jsx";

const getConceptPlaceholder = (document) => {
  const documentTitle = document?.title
    ?.replace(/\.[^/.]+$/, "")
    .trim();

  return documentTitle
    ? `ex. : « ${documentTitle} »`
    : "ex. : « Saisissez un concept du document... »";
};

const AIActions = ({ document }) => {
  const { id: documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      setModalTitle("Résumé généré");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Échec de la génération du résumé.");
    } finally {
      setLoadingAction(null);
    }
  };

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
      setModalTitle(`Explication de « ${concept} »`);
      setModalContent(explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      toast.error("Échec de l’explication du concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* En-tête */}
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
          {/* Générer un résumé */}
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
                  Obtenez un résumé concis de l’ensemble du document.
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

          {/* Expliquer un concept */}
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
                Saisissez un sujet ou un concept du document pour obtenir une
                explication détaillée.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder={getConceptPlaceholder(document)}
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

      {/* Modale de résultat */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="max-h-[60vh] overflow-y-auto prose prose-sm maw-w-none prose-slate ">
          <MarkdownRenderer content={modalContent} />
        </div>
      </Modal>
    </>
  );
};

export default AIActions;
