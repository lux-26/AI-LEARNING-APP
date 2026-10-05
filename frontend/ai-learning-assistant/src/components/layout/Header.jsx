import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext.jsx";
import { Bell, User, Menu } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import toast from "react-hot-toast";
import notificationService from "../../services/notification.Service.js";

moment.locale("fr");

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getNotifications();
        setNotifications(response.data || []);
      } catch (error) {
        toast.error(
          error.message || "Échec du chargement des notifications",
        );
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationsToggle = async () => {
    const shouldOpen = !isNotificationsOpen;
    setIsNotificationsOpen(shouldOpen);

    if (!shouldOpen) {
      return;
    }

    try {
      await notificationService.markAllAsRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      toast.error(
        error.message || "Échec de la mise à jour des notifications",
      );
    }
  };

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

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
              onClick={handleNotificationsToggle}
              aria-label="Afficher les notifications"
              aria-expanded={isNotificationsOpen}
              className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rouded-xl transition-all duration-200 group"
            >
              <Bell
                size={20}
                strokeWidth={2}
                className="group-hover:scale-110 transition-transform duration-200"
              />

              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div
                className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200/60 bg-white p-4 shadow-xl shadow-slate-900/10"
                role="menu"
                aria-label="Notifications"
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h2>
                {notificationsLoading ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Chargement des notifications...
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Aucune notification pour le moment.
                  </p>
                ) : (
                  <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                        role="menuitem"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-800">
                            {notification.title}
                          </h3>
                          <span className="shrink-0 text-xs text-slate-400">
                            {moment(notification.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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
                <p className="text-sm font-semibold text-slate-900">{user?.username || "Utilisateur"}</p>
                <p className="text-xs text-slate-500">{user?.email || "votreemail@example.com"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
