import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueService } from './queueService';
import { networkService } from './networkService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle offline requests - add to queue instead of failing
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Check if it's a network error and method is not GET
    const isNetworkError =
      !error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error');
    const isOffline = !networkService.isOnline();
    const isWriteOperation = config.method && ['post', 'put', 'delete'].includes(config.method);

    if ((isNetworkError || isOffline) && isWriteOperation) {
      // Add to queue for later sync
      console.log('Request queued for offline sync:', config.url);
      const requestId = await QueueService.addToQueue({
        method: (config.method?.toUpperCase() || 'POST') as 'GET' | 'POST' | 'PUT' | 'DELETE',
        url: config.url || '',
        data: config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : undefined,
        headers: config.headers as Record<string, string>,
        priority: 'normal',
      });

      // Return a promise that resolves to indicate success (will be synced later)
      return Promise.resolve({
        data: { _queued: true, requestId },
        status: 202,
        statusText: 'Accepted (Queued)',
        headers: config.headers,
        config,
      });
    }

    return Promise.reject(error);
  }
);

export default api;

