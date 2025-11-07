import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import api from "../../services/api";
import ManualNotification from "../ManualNotification";
import {
  Bell,
  Loader2,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Plus,
} from "lucide-react";

export default function NotificationsPage() {
  const {
    user,
    notifications: contextNotifications,
    loadNotifications,
  } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    loadNotificationsList();
  }, [filter]);

  const loadNotificationsList = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      let filtered = data;

      if (filter === "unread") {
        filtered = data.filter((n) => !n.read);
      } else if (filter === "read") {
        filtered = data.filter((n) => n.read);
      }

      setNotifications(filtered);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      loadNotifications?.(); // Update context
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      loadNotifications?.(); // Update context
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      loadNotifications?.(); // Update context
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }
  };

  const handleManualNotificationSuccess = async () => {
    setShowManualModal(false);
    await loadNotificationsList();
    loadNotifications?.(); // Update context
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "warning":
        return (
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        );
      case "alert":
      case "error": // Keep backward compatibility
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "success":
        return (
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        );
      default:
        return <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-gray-600 dark:text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 animate-in fade-in duration-300">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount !== 1 ? "s" : ""
                }`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {user?.role === "owner" && (
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-white transition-all duration-200 hover:scale-105 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              New Notification
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-1 animate-in fade-in duration-400">
        <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {[
            { key: "all", label: "All", count: notifications.length },
            { key: "unread", label: "Unread", count: unreadCount },
            {
              key: "read",
              label: "Read",
              count: notifications.filter((n) => n.read).length,
            },
          ].map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                animationDelay: `${index * 75}ms`,
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 animate-in fade-in duration-300 flex items-center justify-center gap-2 ${
                filter === tab.key
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 scale-105"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:scale-105"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    filter === tab.key
                      ? "bg-gray-300 dark:bg-gray-700"
                      : "bg-gray-200 dark:bg-gray-800"
                  } animate-in zoom-in duration-200`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden animate-in fade-in duration-500">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase w-32">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {notifications.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center animate-in fade-in duration-300"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {filter === "all"
                          ? "You don't have any notifications yet."
                          : `You don't have any ${filter} notifications.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((notification, index) => {
                  const isInfo = notification.type === "info";
                  const isSuccess = notification.type === "success";
                  const isWarning = notification.type === "warning";
                  const isAlert =
                    notification.type === "alert" ||
                    notification.type === "error"; // Backward compatibility

                  return (
                    <tr
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer animate-in fade-in duration-300"
                    >
                      <td className="px-4 py-3">
                        <div
                          className={`inline-flex p-2 rounded-lg border ${
                            isInfo
                              ? "bg-blue-900/20 border-blue-300 dark:border-blue-800"
                              : isSuccess
                              ? "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                              : isWarning
                              ? "bg-amber-900/20 border-amber-300 dark:border-amber-800"
                              : isAlert
                              ? "bg-red-900/20 border-red-300 dark:border-red-800"
                              : "bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                        {notification.message}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(notification.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            notification.read
                              ? "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                          }`}
                        >
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:text-blue-300 transition-colors duration-200"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:text-red-400 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-800">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center animate-in fade-in duration-300">
              <div className="flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filter === "all"
                    ? "You don't have any notifications yet."
                    : `You don't have any ${filter} notifications.`}
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notification, index) => {
              const isInfo = notification.type === "info";
              const isSuccess = notification.type === "success";
              const isWarning = notification.type === "warning";
              const isAlert =
                notification.type === "alert" || notification.type === "error";

              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                  className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 duration-300 active:bg-gray-200 dark:active:bg-gray-800/50"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`flex-shrink-0 p-2 rounded-lg border ${
                        isInfo
                          ? "bg-blue-900/20 border-blue-300 dark:border-blue-800"
                          : isSuccess
                          ? "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                          : isWarning
                          ? "bg-amber-900/20 border-amber-300 dark:border-amber-800"
                          : isAlert
                          ? "bg-red-900/20 border-red-300 dark:border-red-800"
                          : "bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          {notification.title}
                          {!notification.read && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                          )}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                            notification.read
                              ? "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                          }`}
                        >
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 pl-11">
                    {notification.message}
                  </p>

                  {/* Actions */}
                  <div
                    className="flex gap-2 pl-11"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-300 dark:border-blue-800 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-800 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Manual Notification Modal */}
      {showManualModal && (
        <ManualNotification
          onClose={() => setShowManualModal(false)}
          onSuccess={() => {
            loadNotificationsList();
            loadNotifications?.();
          }}
        />
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedNotification(null)}
              className="sticky top-4 float-right p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 z-10 mr-4"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 px-4 sm:px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 pr-8">
                <div
                  className={`flex-shrink-0 p-2 sm:p-3 rounded-lg border ${
                    selectedNotification.type === "info"
                      ? "bg-blue-900/20 border-blue-300 dark:border-blue-800"
                      : selectedNotification.type === "success"
                      ? "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                      : selectedNotification.type === "warning"
                      ? "bg-amber-900/20 border-amber-300 dark:border-amber-800"
                      : selectedNotification.type === "alert" ||
                        selectedNotification.type === "error"
                      ? "bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                      : "bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 break-words">
                    {selectedNotification.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDate(selectedNotification.createdAt)}</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        selectedNotification.read
                          ? "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                      }`}
                    >
                      {selectedNotification.read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {selectedNotification.message}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-300 dark:border-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              {!selectedNotification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(selectedNotification._id);
                    setSelectedNotification({
                      ...selectedNotification,
                      read: true,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-900/50 border border-blue-300 dark:border-blue-800 transition-all duration-200 order-1"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(selectedNotification._id);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-900/50 border border-red-300 dark:border-red-800 transition-all duration-200 order-2"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 transition-all duration-200 order-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showManualModal && (
        <ManualNotification
          onClose={() => setShowManualModal(false)}
          onSuccess={handleManualNotificationSuccess}
        />
      )}
    </div>
  );
}
