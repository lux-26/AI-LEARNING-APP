import React, { useState, useEffect } from "react";
import flashcardService from "../../services/flashcard.Service.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import FlashcardSetCard from "../../components/flashcards/FlashcardSetCard.jsx";
import toast from "react-hot-toast";

const FlashListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoadind] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();

        console.log("fetchFlashcardSets___", response.data);

        setFlashcardSets(response.data);
      } catch (error) {
        toast.error("Échec du chargement des ensembles de fiches.");
        console.error(error);
      } finally {
        setLoadind(false);
      }
    };
    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="Aucun ensemble de fiches trouvé"
          description="Vous n’avez pas encore généré de fiches. Ouvrez un document pour créer votre premier ensemble."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };
  return (
    <div>
      <PageHeader title="Tous les ensembles de fiches" />
      {renderContent()}
    </div>
  );
};

export default FlashListPage;
