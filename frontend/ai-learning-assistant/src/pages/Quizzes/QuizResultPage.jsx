import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quiz.Service.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { exportQuizResultsPdf } from "../../utils/pdfExport.js";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error("Échec du chargement des résultats du quiz.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Résultats du quiz introuvables.</p>
        </div>
      </div>
    );
  }

  const {
    data: { quiz, results: detailedResults },
  } = results;
  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter((r) => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (score) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-red-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Excellent ! ";
    if (score >= 80) return "Très bon travail ! ";
    if (score >= 70) return "Bon travail ! ";
    if (score >= 60) return "Vous pouvez encore progresser ! ";
    return "Continuez à vous entraîner";
  };
  return (
    <div className="max-w-5xl mx-auto">
      {/* Bouton de retour */}
      <div className="mb-6">
        <Link
          to={`/documents/${quiz.document._id}`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft
            className="w-4 h-5 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />
          Retour au document
        </Link>
      </div>

      <PageHeader title={`${quiz.title || "Quiz"} — Résultats`} />
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() =>
            exportQuizResultsPdf({
              title: quiz.title,
              score,
              results: detailedResults,
            })
          }
          className="inline-flex shrink-0 h-11 items-center justify-center gap-2 px-5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 active:scale-95"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          Exporter PDF
        </button>
      </div>

      {/* Score */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-15 h-15 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-lg shadow-emerald-500/25">
            <Trophy className="w-7 h-7 text-emerald-700" strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Votre score
            </p>
            <div
              className={`inline-block text-5xl font-bold bg-linear-to-r ${getScoreColor(
                score,
              )} bg-clip-text text-transparent mb-2`}
            >
              {score}%
            </div>
            <p className="text-lg font-medium text-slate-700  ">
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Statistiques */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Target className="w-4 h-4 text-slate-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-slate-700">
                {totalQuestions} Total
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2
                className="w-4 h-4 text-emerald-600"
                strokeWidth={2}
              />
              <span className="text-sm font-semibold text-emerald-700">
                {correctAnswers} Correctes
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
              <XCircle className="w-4 h-4 text-rose-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-rose-700">
                {incorrectAnswers} Incorrectes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Révision des questions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-slate-600" strokeWidth={2} />
          <h3 className="text-lg font-semibold text-slate-900">
            Révision détaillée
          </h3>
        </div>

        {detailedResults.map((result, index) => {
          const userAnswerIndex = result.options.findIndex(
            (opt) => opt === result.selectedAnswer,
          );
          const correctAnswerIndex = result.correctAnswer.startsWith("0")
            ? parseInt(result.correctAnswer.substring(1)) - 1
            : result.options.findIndex((opt) => opt === result.correctAnswer);
          const isCorrect = result.isCorrect;

          return (
            <div
              className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg  shadow-slate-200/50"
              key={index}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Question {index + 1}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                    {result.question}
                  </h4>
                </div>

                <div
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCorrect
                      ? "bg-emerald-50 border-2 border-emerald-200"
                      : "bg-rose-50 border-2 border-rose-200"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-600"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <XCircle
                      className="w-5 h-5 text-rose-600"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {result.options.map((option, optIndex) => {
                  const isCorrectOption = optIndex === correctAnswerIndex;
                  const isUserAnswer = optIndex === userAnswerIndex;
                  const isWrongAnswer = isUserAnswer && !isCorrect;

                  return (
                    <div
                      className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        isCorrectOption
                          ? "bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-500/10"
                          : isWrongAnswer
                            ? "bg-rose-50 border-rose-300"
                            : "bg-slate-50 border-slate-200"
                      }`}
                      key={optIndex}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-sm font-medium ${isCorrectOption ? "text-emerald-900" : isWrongAnswer ? "text-rose-900" : "text-slate-700"}`}
                        >
                          {option}
                        </span>
                        <div className="flex items-center gap-2">
                          {isCorrectOption && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-700">
                              <CheckCircle2
                                className="w-3 h-3"
                                strokeWidth={2.5}
                              />
                              Correctes
                            </span>
                          )}
                          {isWrongAnswer && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 border border-rose-300 rounded-lg text-xs font-semibold text-rose-700">
                              <XCircle className="w-3 h-3" strokeWidth={2.5} />{" "}
                              Votre réponse
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Explication */}

                {result.explanation && (
                  <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center mt-0.5">
                        <BookOpen
                          className="w-4 h-4 text-slate-600"
                          strokeWidth={2}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                          Explication
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton d’action */}
      <div className="mt-8 flex justify-center">
        <Link to={`/documents/${quiz.document._id}`}>
          <button className="group relative px-8 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
              Retour au document
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;
