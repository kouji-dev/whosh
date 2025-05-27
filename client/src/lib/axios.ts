import axios from 'axios';
import { config } from '@/config/env';
import { TIKK_TOKEN } from './constants';
import { toast } from '@/components/ui/use-toast';
import { setUserOn401 } from '@/contexts/AuthContext';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TIKK_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unwrapping { data: ... } and handling { message, code } errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem(TIKK_TOKEN);
      if (setUserOn401) setUserOn401(null);
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle API protocol errors: { message, code }
    if (
      error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data &&
      'code' in error.response.data
    ) {
      const { message, code } = error.response.data;
      toast({
        title: 'API Error',
        description: message,
        variant: 'destructive',
      });
      return Promise.reject({ message, code, status: error.response.status });
    }

    // Fallback to default error
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    toast({
      title: 'API Error',
      description: errorMessage,
      variant: 'destructive',
    });
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient; 