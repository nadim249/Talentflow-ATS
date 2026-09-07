
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});





export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    // Server responded with an error payload { message: '...' }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Network error, CORS error, or timeout
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}


// --- AUTHENTICATION ---
export const authAPI = {
  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};




export default api;