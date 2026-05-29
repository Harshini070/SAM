// Lightweight API client placeholder.
// Replace with real axios/fetch implementation and install dependencies.

import { Platform } from 'react-native';
// import axios from 'axios';

export const API_BASE = 'https://api.example.com';

// If you add axios, create and export a configured instance here.
// Example with axios:
// export const client = axios.create({ baseURL: API_BASE, timeout: 15000 });
// client.interceptors.request.use(async (config) => {
//   // attach JWT from secure storage / AsyncStorage
//   return config;
// });

// Fallback stubbed client for offline/mock usage
export const client = {
  get: async (path: string) => ({ data: null, path }),
  post: async (path: string, body: any) => ({ data: null, path, body }),
  put: async (path: string, body: any) => ({ data: null, path, body }),
  delete: async (path: string) => ({ data: null, path }),
};

// Notes:
// - Store JWT in SecureStore (recommended) or AsyncStorage for production.
// - Add an interceptor to automatically add Authorization header.
// - Consider refresh-token flow and global error handling here.
