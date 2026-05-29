import axios from 'axios';

export const API_BASE = 'http://127.0.0.1:8000';

export const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});