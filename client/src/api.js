import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

export const evaluationsApi = {
  getAll: (params = {}) => api.get('/evaluations', { params }).then(r => r.data),
  getOne: (id) => api.get(`/evaluations/${id}`).then(r => r.data),
  create: (data) => api.post('/evaluations', data).then(r => r.data),
  update: (id, data) => api.patch(`/evaluations/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/evaluations/${id}`).then(r => r.data),
};

export const labelsApi = {
  getAll: () => api.get('/labels').then(r => r.data),
  create: (data) => api.post('/labels', data).then(r => r.data),
};

export const statsApi = {
  get: () => api.get('/stats').then(r => r.data),
};

export default api;
