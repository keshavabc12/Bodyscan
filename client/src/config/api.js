// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin  // Use the same origin in production
  : 'http://localhost:5000'; // Use localhost in development

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG; 