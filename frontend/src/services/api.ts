import axios, { AxiosError } from 'axios';

// Force hardcode for development if env var is not available
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('=== API SERVICE INIT ===');
console.log('API_URL resolved to:', API_URL);
console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🔵 Making request to:', `${config.baseURL || ''}${config.url || ''}`);
    return config;
  },
  (error) => {
    console.error('🔴 Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('🟢 Response received:', response.status, 'from', response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('🔴 Response error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });
    const message = error.response?.data || error.message || 'An error occurred';
    return Promise.reject({
      message: typeof message === 'string' ? message : JSON.stringify(message),
      statusCode: error.response?.status,
      error: error.response?.statusText || error.message,
    });
  }
);

export default api;
