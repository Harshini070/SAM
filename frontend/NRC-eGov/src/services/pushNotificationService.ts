import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
<<<<<<< HEAD
import api from './api';
=======
import { api } from './api';
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8

// Configure notification channel
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationListener {
  (notification: Notifications.Notification): void;
}

interface DeviceTokenListener {
  (token: string): void;
}

class PushNotificationManager {
  private listeners: NotificationListener[] = [];
  private deviceTokenListeners: DeviceTokenListener[] = [];
  private currentToken: string | null = null;

  async initialize(): Promise<void> {
    try {
      // Request notification permissions
      await this.requestPermissions();

      // Get device token
      const token = await this.registerForPushNotificationsAsync();
      if (token) {
        this.currentToken = token;
        await this.storeToken(token);
        await this.registerDeviceWithBackend(token);
        this.notifyDeviceTokenListeners(token);
      }

      // Set up notification listeners
      this.setupListeners();

      console.log('✓ Push notifications initialized');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  private async requestPermissions(): Promise<void> {
    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permission');
    }
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: 'a95a1ac0-3a76-4da1-bd5b-9a0a1d5e5f5f', // Replace with actual project ID
        })
      ).data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  private setupListeners(): void {
    // Listen for notifications when app is foregrounded
    Notifications.addNotificationReceivedListener((notification) => {
      this.notifyListeners(notification);
    });

    // Listen for user tapping on notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      const notification = response.notification;
      this.notifyListeners(notification);
      this.handleNotificationAction(notification.request.content.data);
    });
  }

  private async registerDeviceWithBackend(token: string): Promise<void> {
    try {
      await api.post('/push/register-device', {
        device_token: token,
        device_type: Platform.OS === 'ios' ? 'ios' : 'android',
      });
    } catch (error) {
      console.warn('Failed to register device with backend:', error);
    }
  }

  private async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('expo_push_token', token);
    } catch (error) {
      console.error('Failed to store device token:', error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('Failed to retrieve stored token:', error);
      return null;
    }
  }

  async unregisterDevice(): Promise<void> {
    try {
      if (this.currentToken) {
        await api.post(`/push/unregister-device/${this.currentToken}`);
        await AsyncStorage.removeItem('expo_push_token');
        this.currentToken = null;
      }
    } catch (error) {
      console.error('Failed to unregister device:', error);
    }
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  subscribeToDeviceToken(listener: DeviceTokenListener): () => void {
    this.deviceTokenListeners.push(listener);
    return () => {
      this.deviceTokenListeners = this.deviceTokenListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(notification: Notifications.Notification): void {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  private notifyDeviceTokenListeners(token: string): void {
    this.deviceTokenListeners.forEach((listener) => {
      try {
        listener(token);
      } catch (error) {
        console.error('Error in device token listener:', error);
      }
    });
  }

  private handleNotificationAction(data: Record<string, any>): void {
    // Handle notification taps based on action type
    if (data?.action === 'view_child') {
      // Navigate to child details
      console.log('Viewing child:', data.child_id);
    } else if (data?.action === 'view_nrc') {
      // Navigate to NRC details
      console.log('Viewing NRC:', data.nrc_id);
    } else if (data?.action === 'view_alert') {
      // Navigate to alerts
      console.log('Viewing alert:', data.alert_id);
    }
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export const pushNotificationManager = new PushNotificationManager();
