
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// REQUEST INTERCEPTOR

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    // Returning response directly so callers have standard access
    return response;
  },
  (error) => {
    // If the server returns 401 Unauthorized, token has expired or is invalid.
    if (error.response?.status === 401) {
      localStorage.removeItem('tf_token');

      // Only redirect if not already on the login or register page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


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

// --- JOBS ---
export const jobsAPI = {
  // params can include { search, status }
  list: async (params) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post('/jobs', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/jobs/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};


// --- CANDIDATES ---
export const candidatesAPI = {
  // params can include { search, stage }
  list: async (params) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },
  // Note: For FormData (file uploads), Axios automatically sets
  // 'Content-Type: multipart/form-data' with the correct boundary.
  create: async (formData) => {
    const response = await api.post('/candidates', formData);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },
  addNote: async (id, text) => {
    const response = await api.post(`/candidates/${id}/notes`, { text });
    return response.data;
  },
  updateStage: async (id, stage) => {
    const response = await api.patch(`/candidates/${id}/stage`, { stage });
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
};

// --- INTERVIEWS ---
export const interviewsAPI = {
  list: async (params) => {
    const response = await api.get('/interviews', { params });
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post('/interviews', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.patch(`/interviews/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  },
};

// --- ANALYTICS ---
export const analyticsAPI = {
  overview: async (params) => {
    const response = await api.get('/analytics/overview', { params });
    return response.data;
  },
};

// --- PUBLIC (CAREER PORTAL) ---
export const publicAPI = {
  listJobs: async () => {
    const response = await publicApi.get('/public/jobs');
    return response.data;
  },
  getJob: async (id) => {
    const response = await publicApi.get(`/public/jobs/${id}`);
    return response.data;
  },
  apply: async (jobId, formData) => {
    const response = await publicApi.post(`/public/apply/${jobId}`, formData);
    return response.data;
  },
};



export default api;