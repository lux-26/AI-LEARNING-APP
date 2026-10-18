import { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageSquare,
  Sparkles,
  Copy,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/ai.Service.js";
import { useAuth } from "../../context/authContext.jsx";
import Spinner from "../common/Spinner.jsx";
import MarkdownRenderer from "../common/MarkdownRenderer.jsx";

const getSpeechText = (content) =>
  content
    .replace(/```[\w-]*\n?/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const messagesEnRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEnRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      console.error("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setMessage((currentMessage) =>
          currentMessage ? `${currentMessage} ${transcript}` : transcript,
        );
      }
    };
    recognition.onerror = (event) => {
      console.error("Erreur de reconnaissance vocale:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleMessageSpeech = (content, index) => {
    if (!("speechSynthesis" in window)) {
      console.error("La synthèse vocale n'est pas supportée par ce navigateur.");
      return;
    }

    if (speakingMessageIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getSpeechText(content));
    utterance.lang = "fr-FR";
    utterance.onend = () => setSpeakingMessageIndex(null);
    utterance.onerror = () => setSpeakingMessageIndex(null);
    setSpeakingMessageIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
        relevantPages: response.data.relevantPages,
      };
      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Une erreur est survenue. Veuillez réessayer.",
        timestamp: new Date(),
        isError: true,
        retryQuestion: userMessage.content,
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(index);
      window.setTimeout(() => setCopiedMessageIndex(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const retryMessage = (question) => {
    setMessage(question);
  };

  const suggestedQuestions = [
    "Quel est le sujet principal du document ?",
    "Peux-tu résumer les points importants ?",
    "Peux-tu expliquer un concept clé ?",
  ];

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-4 ${isUser ? "justify-end" : ""}`}
      >
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        )}
        <div
          className={`max-w-lg p-4 rounded-2xl shadow-sm ${isUser ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-br-md" : "bg-white border border-slate-200/60 text-slate-800 rounded-bl-md"}`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.content} </p>
          ) : (
            <div className="relative">
              <div className="prose prose-sm max-w-none prose-slate">
                <MarkdownRenderer content={msg.content} />
              </div>
              {!msg.isError && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => copyMessage(msg.content, index)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                    {copiedMessageIndex === index ? "Copié" : "Copier"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMessageSpeech(msg.content, index)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={
                      speakingMessageIndex === index
                        ? "Arrêter la lecture"
                        : "Écouter la réponse"
                    }
                    title={
                      speakingMessageIndex === index
                        ? "Arrêter la lecture"
                        : "Écouter la réponse"
                    }
                  >
                    {speakingMessageIndex === index ? (
                      <VolumeX className="w-3.5 h-3.5" strokeWidth={2} />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                    {speakingMessageIndex === index ? "Arrêter" : "Écouter"}
                  </button>
                  {Array.isArray(msg.relevantPages) &&
                    msg.relevantPages.length > 0 && (
                      <span className="text-xs text-slate-400">
                        Source : page{msg.relevantPages.length > 1 ? "s" : ""}{" "}
                        {msg.relevantPages.join(", ")}
                      </span>
                    )}
                  {msg.isError && (
                    <button
                      type="button"
                      onClick={() => retryMessage(msg.retryQuestion)}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                      Réessayer
                    </button>
                  )}
                </div>
              )}
              {msg.isError && (
                <button
                  type="button"
                  onClick={() => retryMessage(msg.retryQuestion)}
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                  Réessayer
                </button>
              )}
            </div>
          )}
        </div>
        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0 shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Chargement de l'historique...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Message Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-linear-to-br from-slate-50/50 to-slate-50/50">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <MessageSquare
                className="w-8 h-8 text-emerald-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Démarrer une conversation
            </h3>
            <p className="text-sm text-slate-500">
              Posez-moi n'importe quelle question sur le document !
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}
        {history.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setMessage(question)}
                className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs transition-all duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEnRef} />
        {loading && (
          <div className="flex items-center gap-3 my-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/60">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-slate-200/60 bg-white/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Posez une question complémentaire..."
            className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
            disabled={loading}
          />
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={loading}
            className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
              isListening
                ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                : "border-slate-200 bg-slate-50/50 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
            aria-label={
              isListening
                ? "Arrêter l'enregistrement vocal"
                : "Envoyer un message vocal"
            }
            title={
              isListening
                ? "Arrêter l'enregistrement vocal"
                : "Dicter un message"
            }
          >
            {isListening ? (
              <MicOff className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Mic className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shrink-0 w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white flex items-center justify-center rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 "
          >
            <Send className="w-5 h-5" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
