import React, { useState } from "react";
import { useAuth } from "../../context/authContext.jsx";
import { Bell, User, Menu } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-full px-6+">
        {/*Bouton de menu mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          aria-label="Afficher ou masquer la barre latérale"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
              aria-label="Afficher les notifications"
              aria-expanded={isNotificationsOpen}
              className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rouded-xl transition-all duration-200 group"
            >
              <Bell
                size={20}
                strokeWidth={2}
                className="group-hover:scale-110 transition-transform duration-200"
              />

              {!isNotificationsOpen && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200/60 bg-white p-4 shadow-xl shadow-slate-900/10">
                <h2 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Aucune nouvelle notification pour le moment.
                </p>
              </div>
            )}
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200">
                <User size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.username || "User"}</p>
                <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
