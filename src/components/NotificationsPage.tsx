import React, { useState } from 'react';
import { Bell, Trash2, Archive, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'alert' | 'info';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

export default function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'promo':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'order':
        return 'bg-green-50';
      case 'promo':
        return 'bg-amber-50';
      case 'alert':
        return 'bg-red-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-slate-50';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 mb-2">Notifications</h1>
            <p className="text-sm text-slate-600">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border-2 border-slate-200 transition-all ${getNotificationBg(notif.type, notif.read)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="pt-0.5 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm mb-1 ${!notif.read ? 'text-slate-950' : 'text-slate-700'}`}>
                      {notif.title}
                      {!notif.read && <span className="ml-2 inline-block w-2 h-2 bg-slate-900 rounded-full"></span>}
                    </h3>
                    <p className="text-xs text-slate-600 mb-2">{notif.message}</p>
                    <p className="text-xs text-slate-500">{formatTime(notif.timestamp)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
