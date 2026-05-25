import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { pushNotificationManager } from '../services/pushNotificationService';

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  lastNotification: Notification | null;
  unreadCount: number;
  deviceToken: string | null;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  useEffect(() => {
    // Initialize push notifications
    pushNotificationManager.initialize();

    // Get stored token
    pushNotificationManager.getStoredToken().then((token) => {
      if (token) {
        setDeviceToken(token);
      }
    });

    // Subscribe to notifications
    const unsubscribe = pushNotificationManager.subscribe((notification: Notifications.Notification) => {
      const newNotification: Notification = {
        id: notification.request.identifier,
        title: notification.request.content.title || 'Notification',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        timestamp: new Date(),
      };

      setLastNotification(newNotification);
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    });

    // Subscribe to device token updates
    const unsubscribeToken = pushNotificationManager.subscribeToDeviceToken((token) => {
      setDeviceToken(token);
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif } : notif
      )
    );
  };

  const unreadCount = notifications.length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        lastNotification,
        unreadCount,
        deviceToken,
        clearNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
