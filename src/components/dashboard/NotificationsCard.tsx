import React from 'react';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { DashboardCard } from './DashboardCard';
import { LoadingSpinner } from '../common';

export const NotificationsCard: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  if (isLoading) {
    return (
      <DashboardCard 
        title="Notificações" 
        icon={<Bell className="w-5 h-5" />}
      >
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </DashboardCard>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <DashboardCard 
      title={`Notificações ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
      icon={<Bell className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nenhuma notificação no momento
          </div>
        ) : (
          <>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-colors ${
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex items-center text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};
