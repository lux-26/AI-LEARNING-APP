import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext.jsx";
import { Bell, User, Menu } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import notificationService from "../../services/notification.Service.js";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationService.getNotifications();
        setNotifications(response.data || []);
      } catch (error) {
        console.error("Échec du chargement des notifications :", error);
      }
    };

    loadNotifications();
  }, []);

  const handleToggleNotifications = async () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen && notifications.some((notification) => !notification.isRead)) {
      try {
        await notificationService.markAllAsRead();
        setNotifications((current) =>
          current.map((notification) => ({ ...notification, isRead: true })),
        );
      } catch (error) {
        console.error("Échec de la mise à jour des notifications :", error);
      }
    }
  };

  moment.locale("fr");
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-full px-6+">
        {/*Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleNotifications}
            className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
            aria-label="Notifications"
          >
            <Bell
              size={20}
              strokeWidth={2}
              className="group-hover:scale-110 transition-transform duration-200"
            />

            {notifications.some((notification) => !notification.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </button>
          {isOpen && (
            <div className="absolute right-6 top-14 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <h2 className="px-2 pb-2 text-sm font-semibold text-slate-900">
                Notifications
              </h2>
              {notifications.length === 0 ? (
                <p className="px-2 py-4 text-sm text-slate-500">
                  Aucune notification pour le moment.
                </p>
              ) : (
                <div className="max-h-80 space-y-1 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="rounded-lg px-2 py-2 hover:bg-slate-50">
                      <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                      <p className="text-xs text-slate-600">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Il y a {moment(notification.createdAt).fromNow().replace(/^il y a /i, "")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Profile */}
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
