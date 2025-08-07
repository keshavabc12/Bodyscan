// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin  // Use the same origin in production
  : 'http://localhost:5000'; // Use localhost in development

// Debug logging
console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG; 