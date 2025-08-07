import axios from 'axios';
import API_CONFIG from '../config/api';

// Create axios instance with base configuration
const api = axios.create(API_CONFIG);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export default api; 