import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Content endpoints
export const contentAPI = {
  search: (query) => apiClient.get('/search', { params: { q: query } }),
  getAll: () => apiClient.get('/content'),
  getById: (id) => apiClient.get(`/content/${id}`),
  getByType: (type) => apiClient.get(`/content/type/${type}`),
  create: (data) => apiClient.post('/content', data),
  update: (id, data) => apiClient.put(`/content/${id}`, data),
  delete: (id) => apiClient.delete(`/content/${id}`),
  downloadUrl: (id) => `${API_BASE_URL}/content/${id}/download`,
}

// Subject endpoints
export const subjectAPI = {
  getAll: () => apiClient.get('/subjects'),
  getById: (id) => apiClient.get(`/subjects/${id}`),
  create: (data) => apiClient.post('/subjects', data),
  update: (id, data) => apiClient.put(`/subjects/${id}`, data),
  delete: (id) => apiClient.delete(`/subjects/${id}`),
}

// Stats endpoints
export const statsAPI = {
  getStats: () => apiClient.get('/stats'),
}

// Admin endpoints
export const adminAPI = {
  login: (credentials) => apiClient.post('/admin/login', credentials),
}

export default apiClient
