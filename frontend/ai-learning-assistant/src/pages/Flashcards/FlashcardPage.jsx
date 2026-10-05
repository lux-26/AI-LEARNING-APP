import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcard.Service.js";
import aiService from "../../services/ai.Service.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal.jsx";
import Flashcard from "../../components/flashcards/Flashcard.jsx";

const FlashcardPage = () => {
  const { id: documentId } = useParams();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoadind] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFlashcards = useCallback(async () => {
    setLoadind(true);
    try {
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.date?.[0]);
      setFlashcards(response.date?.[0]?.cards || []);
    } catch (error) {
      toast.error("Échec du chargement des fiches.");
      console.error(error);
    } finally {
      setLoadind(false);
    }
  }, [documentId]);

  useEffect(() => {
    void Promise.resolve().then(fetchFlashcards);
  }, [documentId, fetchFlashcards]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Fiches générées avec succès !");
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Échec de la génération des fiches.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length,
    );
  };

  const handleReview = async (difficulty) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, difficulty);
      setFlashcards((cards) =>
        cards.map((card) =>
          card._id === currentCard._id
            ? {
                ...card,
                difficulty,
                reviewCount: (card.reviewCount || 0) + 1,
              }
            : card,
        ),
      );
      toast.success("Fiche révisée !");
    } catch {
      toast.error("Échec de la révision de la fiche.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card,
        ),
      );

      toast.success("État favori de la fiche mis à jour !");
    } catch {
      toast.error("Échec de la mise à jour du favori.");
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setIsDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success("Lot de fiches supprimé avec succès !");
      setIsDeleteModalOpen(false);
      fetchFlashcards(); //Refethc to show empty state
    } catch (error) {
      toast.error(error.message || "Échec de la suppression du lot de fiches.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="Aucune fiche pour le moment"
          description="Générez des fiches à partir de votre document pour commencer à apprendre."
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft size={16} />             Précédente
          </Button>
          <span className="text-sm text-neutral-600">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
            onClick={handleNextCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            Suivante <ChevronRight size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Difficulté :</span>
          {[
            ["hard", "Difficile"],
            ["medium", "Moyen"],
            ["easy", "Facile"],
          ].map(([difficulty, label]) => (
            <Button
              key={difficulty}
              onClick={() => handleReview(difficulty)}
              variant="secondary"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft scale={16} />
          Retour au document
        </Link>
      </div>
      <PageHeader title="Flashcards">
        <div className="flex gap-2">
          {!loading &&
            (flashcards.length > 0 ? (
              <>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />                   Supprimer le lot
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGenerateFlashcards}
                disabled={generating}
                className="disabled:opacity-100"
              >
                {generating ? (
                  <>
                    <span className="w-4 h-4 shrink-0 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Générer de nouvelles cartes
                  </>
                )}
              </Button>
            ))}
        </div>
      </PageHeader>

      {renderFlashcardContent()}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteFlashcardSet}
        itemName="toutes les cartes mémoire de ce document"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FlashcardPage;
