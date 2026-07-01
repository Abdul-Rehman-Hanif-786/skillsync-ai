import api from './api'

// Auth Services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (full_name, email, password) => api.post('/auth/register', { full_name, email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetToken: (token) => api.get(`/auth/verify-reset-token?token=${token}`),
  resetPassword: (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
  getMe: () => api.get('/auth/me'),
}

// Dashboard Services
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: (limit = 10) => api.get(`/dashboard/activity?limit=${limit}`),
  getSkills: () => api.get('/dashboard/skills'),
  getCareer: () => api.get('/dashboard/career'),
  getLearning: () => api.get('/dashboard/learning'),
}

// Profile Services
export const profileService = {
  get: () => api.get('/profile/'),
  create: (data) => api.post('/profile/', data),
  update: (data) => api.put('/profile/', data),
  addSkill: (data) => api.post('/profile/skills/', data),
  removeSkill: (skillId) => api.delete(`/profile/skills/${skillId}`),
  updateSkill: (skillId, data) => api.put(`/profile/skills/${skillId}`, data),
}

// Skills Services
export const skillsService = {
  getAll: (params = {}) => api.get('/skills/', { params }),
  search: (query) => api.get('/skills/search', { params: { q: query } }),
}

// Resume Services
export const resumeService = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/resume/history'),
  getById: (id) => api.get(`/resume/${id}`),
  delete: (id) => api.delete(`/resume/${id}`),
}

// Recommendation Services
export const recommendationService = {
  generate: (data) => api.post('/recommendations/generate', data),
  getAll: (type) => api.get('/recommendations/', { params: { recommendation_type: type } }),
  getSkillGap: (targetRole) => api.get('/recommendations/skill-gap', { params: { target_role: targetRole } }),
  getCareerSuggestions: () => api.get('/recommendations/career-suggestions'),
  getAvailableRoles: () => api.get('/recommendations/available-roles'),
  delete: (id) => api.delete(`/recommendations/${id}`),
}

// Roadmap Services
export const roadmapService = {
  generate: (data) => api.post('/roadmap/generate', data),
  getAll: () => api.get('/roadmap/my'),
  getById: (id) => api.get(`/roadmap/${id}`),
  delete: (id) => api.delete(`/roadmap/${id}`),
  getCareerAdvice: (question) => api.post('/roadmap/career-advice', { question }),
}
