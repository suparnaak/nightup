// src/api/axiosClient.ts

import axios from 'axios';
import { getToken } from '../utils/localStorage';

const axiosClient = axios.create({
  // Use a relative URL instead of absolute to use Vite's proxy
  baseURL: '/api', // Remove the 'http://localhost:5000' part
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;