import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header automatically if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// API Helper Methods
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (formData) => api.post('/jobs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateJob: (id, formData) => api.put(`/jobs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getApplications: (params) => api.get('/applications', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
};

export default api;
