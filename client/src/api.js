import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export default api;

export const evaluationsApi = {
  getAll: (params = {}) => api.get('/api/evaluations', { params }).then(r => r.data),
  getOne: (id) => api.get(`/api/evaluations/${id}`).then(r => r.data),
  create: (data) => api.post('/api/evaluations', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/evaluations/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/evaluations/${id}`).then(r => r.data),
};

export const labelsApi = {
  getAll: () => api.get('/api/labels').then(r => r.data),
  create: (data) => api.post('/api/labels', data).then(r => r.data),
};

export const statsApi = {
  get: () => api.get('/api/stats').then(r => r.data),
};
