import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, BookOpen, BrainCircuit, MessageSquare, Search } from "lucide-react";
import Modal from "./Modal.jsx";
import documentService from "../../services/document.Service.js";
import flashcardService from "../../services/flashcard.Service.js";
import quizService from "../../services/quiz.Service.js";

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState([]);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const loadSearchData = async () => {
      setLoading(true);
      try {
        const [documentData, flashcardData, quizData] = await Promise.all([
          documentService.getDocuments(),
          flashcardService.getAllFlashcardSets(),
          quizService.getAllQuizzes(),
        ]);
        setDocuments(Array.isArray(documentData) ? documentData : []);
        setFlashcardSets(
          Array.isArray(flashcardData?.data) ? flashcardData.data : [],
        );
        setQuizzes(Array.isArray(quizData?.data) ? quizData.data : []);
      } catch (error) {
        console.error("Échec du chargement de la recherche globale :", error);
      } finally {
        setLoading(false);
      }
    };

    loadSearchData();
  }, [isOpen]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = (value) =>
      !normalizedQuery || value.toLowerCase().includes(normalizedQuery);

    return [
      ...documents
        .filter((document) => matches(document.title || ""))
        .map((document) => ({
          id: `document-${document._id}`,
          title: document.title,
          type: "Document",
          icon: FileText,
          path: `/documents/${document._id}`,
        })),
      ...documents
        .filter((document) => matches(`${document.title || ""} conversation`))
        .map((document) => ({
          id: `conversation-${document._id}`,
          title: `Conversation — ${document.title}`,
          type: "Conversation",
          icon: MessageSquare,
          path: `/documents/${document._id}`,
        })),
      ...flashcardSets
        .filter((set) =>
          matches(`${set.documentId?.title || ""} flashcards`),
        )
        .map((set) => ({
          id: `flashcard-${set._id}`,
          title: `Flashcards — ${set.documentId?.title || "Document"}`,
          type: "Flashcards",
          icon: BookOpen,
          path: `/documents/${set.documentId?._id}/flashcards`,
        })),
      ...quizzes
        .filter((quiz) => matches(`${quiz.title || ""} ${quiz.documentId?.title || ""}`))
        .map((quiz) => ({
          id: `quiz-${quiz._id}`,
          title: quiz.title,
          type: "Quiz",
          icon: BrainCircuit,
          path: `/quizzes/${quiz._id}`,
        })),
    ];
  }, [documents, flashcardSets, quizzes, query]);

  const selectResult = (result) => {
    setIsOpen(false);
    setQuery("");
    navigate(result.path);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setQuery("");
      }}
      title="Recherche globale"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 focus-within:border-emerald-500 focus-within:bg-white transition-all duration-200">
          <Search className="w-4 h-4 text-slate-400" strokeWidth={2} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un document, quiz ou flashcard..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
          />
          <span className="text-xs text-slate-400">Échap</span>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Recherche en cours...</p>
        ) : results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto space-y-1">
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => selectResult(result)}
                className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-all duration-200"
              >
                <result.icon className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-900 truncate">
                    {result.title}
                  </span>
                  <span className="block text-xs text-slate-500">{result.type}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="w-7 h-7 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Aucun résultat trouvé.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GlobalSearch;
