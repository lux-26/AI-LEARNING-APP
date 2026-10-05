import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/common/Spinner.jsx";
import progressService from "../../services/progress.Service.js";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Award,
  Flame,
  Target,
  Trophy,
  ArrowRight,
  Lock,
} from "lucide-react";

const emptyDashboardData = {
  overview: {
    totalDocuments: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    averageScore: 0,
    masteredFlashcards: 0,
    cardsToReviewToday: 0,
    studyStreak: 0,
    badges: [],
  },
  progress: [],
  recentActivity: {
    documents: [],
    quizzes: [],
  },
};

const badgeMetadata = {
  "first-document": {
    title: "Premier Document",
    description: "A importé son premier cours",
    icon: FileText,
    color: "text-blue-600",
    background: "bg-blue-50",
    border: "border-blue-200/60",
  },
  "first-quiz": {
    title: "Premier Quiz",
    description: "A terminé son premier quiz",
    icon: BrainCircuit,
    color: "text-emerald-600",
    background: "bg-emerald-50",
    border: "border-emerald-200/60",
  },
  "first-flashcard": {
    title: "Première Révision",
    description: "A révisé ses premières fiches",
    icon: BookOpen,
    color: "text-purple-600",
    background: "bg-purple-50",
    border: "border-purple-200/60",
  },
  "perfect-quiz": {
    title: "Score Parfait",
    description: "A obtenu 100% à un quiz",
    icon: Trophy,
    color: "text-orange-600",
    background: "bg-orange-50",
    border: "border-orange-200/60",
  },
};

const badgeIds = Object.keys(badgeMetadata);

const normalizeDashboardData = (response) => {
  const payload = response?.data ?? response;
  const data = payload?.data ?? payload?.stats ?? payload;

  return {
    ...emptyDashboardData,
    ...data,
    overview: {
      ...emptyDashboardData.overview,
      ...(data?.overview ?? data?.stats ?? {}),
      badges: Array.isArray(data?.overview?.badges)
        ? data.overview.badges
        : Array.isArray(data?.badges)
          ? data.badges
          : [],
    },
    progress: Array.isArray(data?.progress) ? data.progress : [],
    recentActivity: {
      ...emptyDashboardData.recentActivity,
      ...(data?.recentActivity ?? {}),
      documents: Array.isArray(data?.recentActivity?.documents)
        ? data.recentActivity.documents
        : [],
      quizzes: Array.isArray(data?.recentActivity?.quizzes)
        ? data.recentActivity.quizzes
        : [],
    },
  };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const formatActivityDate = (value) => {
    if (!value) return "Date inconnue";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date inconnue"
      : date.toLocaleString("fr-FR");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();
        setDashboardData(normalizeDashboardData(response));
      } catch (error) {
        toast.error("Échec du chargement du tableau de bord.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  if (loading) {
    return <Spinner />;
  }

  const stats = [
    {
      label: "Documents totaux",
      Value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Fiches totales",
      Value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Quiz totaux",
      Value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
    },
    {
      label: "Score moyen",
      Value: `${dashboardData.overview.averageScore || 0}%`,
      icon: TrendingUp,
      gradient: "from-orange-400 to-amber-500",
      shadowColor: "shadow-orange-500/25",
    },
    {
      label: "Fiches maîtrisées",
      Value: dashboardData.overview.masteredFlashcards || 0,
      icon: Target,
      gradient: "from-cyan-400 to-blue-500",
      shadowColor: "shadow-cyan-500/25",
    },
    {
      label: "Cartes à réviser",
      Value: dashboardData.overview.cardsToReviewToday || 0,
      icon: BookOpen,
      gradient: "from-violet-400 to-purple-500",
      shadowColor: "shadow-violet-500/25",
    },
    {
      label: "Série actuelle",
      Value: `${dashboardData.overview.studyStreak || 0} jour(s)`,
      icon: Flame,
      gradient: "from-rose-400 to-orange-500",
      shadowColor: "shadow-rose-500/25",
    },
    {
      label: "Badges obtenus",
      Value: dashboardData.overview.badges?.length || 0,
      icon: Award,
      gradient: "from-yellow-400 to-orange-500",
      shadowColor: "shadow-yellow-500/25",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px-16px] opacity-30 pointer-events-none " />
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2 ">
            Tableau de bord
          </h1>
          <p className="text-slate-500 text-sm">
            Suivez vos progrès et votre activité d'apprentissage
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
                <div
                  className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-slate-900 tracking-tight">
                {stat.Value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5 items-stretch">
          <div className="h-full flex flex-col bg-white backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                Progression des documents
              </h3>
            </div>
            {dashboardData.progress?.length > 0 ? (
              <div className="flex flex-1 flex-col">
                <div className="space-y-4">
                  {dashboardData.progress.slice(0, 3).map((item) => (
                    <button
                    key={item._id}
                    type="button"
                    onClick={() => navigate(`/documents/${item.documentId?._id}`)}
                    disabled={!item.documentId?._id}
                    className="group w-full space-y-2 text-left disabled:cursor-not-allowed"
                    >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
                        <span className="truncate">
                          {item.documentId?.title || "Document"}
                        </span>
                        <ArrowRight className="w-4 h-4 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/documents")}
                  className="mt-auto pt-6 text-left text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Voir tous les documents <span aria-hidden="true">→</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <p className="text-sm text-slate-500">
                  Commencez une activité sur un document pour voir votre progression.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/documents")}
                  className="mt-auto pt-6 text-left text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Voir tous les documents <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-full flex flex-col bg-white backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                Badges obtenus
              </h3>
            </div>
            {badgeIds.length > 0 ? (
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-3">
                {badgeIds.map((badge) => {
                  const metadata = badgeMetadata[badge];
                  const BadgeIcon = metadata.icon;
                  const isUnlocked = dashboardData.overview.badges?.includes(badge);

                  return (
                    <div
                      key={badge}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        isUnlocked
                          ? `${metadata.background} ${metadata.border}`
                          : "border-slate-200/60 bg-slate-50 opacity-40"
                      }`}
                      title={metadata.description}
                    >
                      <div className="relative shrink-0">
                        <BadgeIcon
                          className={`w-5 h-5 ${
                            isUnlocked ? metadata.color : "text-slate-500"
                          }`}
                          strokeWidth={2}
                        />
                        {!isUnlocked && (
                          <Lock className="absolute -right-2 -bottom-1 w-3 h-3 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {metadata.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {metadata.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Vos badges apparaîtront ici après vos premières activités.
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">
              Activité récente
            </h3>
          </div>

          {dashboardData.recentActivity &&
          (dashboardData.recentActivity.documents.length > 0 ||
            dashboardData.recentActivity.quizzes.length > 0) ? (
            <div className="space-y-3">
              {[
                ...(dashboardData.recentActivity.documents || []).map(
                  (doc) => ({
                    id: doc._id,
                    description: doc.title,
                    timestamp: doc.lastAccessed,
                    link: `/documents/${doc._id}`,
                    type: "document",
                  }),
                ),
                ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
                  id: quiz._id,
                  description: quiz.title,
                  timestamp: quiz.createdAt || quiz.lastAttempted,
                  link: `/quizzes/${quiz._id}`,
                  type: "quiz",
                })),
              ]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="group flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${activity.type === "document" ? "bg-linear-to-r from-blue-400 to-cyan-500" : "bg-linear-to-r from-emerald-400 to-teal-500"} `}
                        />
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.type === "document"
                            ? "Document consulté : "
                            : "Quiz tenté : "}
                          <span className="text-slate-700">
                            {activity.description}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 pl-4">
                        {formatActivityDate(activity.timestamp)}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {activity.link && (
                        <a
                          href={activity.link}
                          className="px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 whitespace-nowrap"
                        >
                          Voir
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 rounded-2xl bg-slate-100 mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Aucune activité récente.</p>
              <p className="text-xs text-slate-500 mt-1">
                Commencez à apprendre pour voir vos progrès ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
