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
        toast.error("Failed to fetch flashcard sets.");
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
          title="No Flashcard Sets Found"
          description="ou haven't generated any flashcards yet. Go to a document to create your first set."
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
      <PageHeader title="All Flashcard Sets" />
      {renderContent()}
    </div>
  );
};

export default FlashListPage;
