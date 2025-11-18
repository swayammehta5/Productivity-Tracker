import axios from 'axios';
import { toast } from 'react-toastify';

// Configure API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 seconds
  withCredentials: true
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token if refresh token exists
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (error) {
        // If refresh token fails, clear auth and redirect to home
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    // Handle other error statuses
    if (status === 403) {
      toast.error('You are not authorized to perform this action');
    } else if (status === 404) {
      toast.error('The requested resource was not found');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ✅ AUTH
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (tokenId) => api.post('/auth/google', { tokenId }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// ✅ HABITS
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  complete: (id, date) => api.post(`/habits/${id}/complete`, { date }),
  uncomplete: (id, date) => api.post(`/habits/${id}/uncomplete`, { date }),
  getStats: () => api.get('/habits/stats')
};

// ✅ TASKS
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats')
};

// ✅ Stats
export const statsAPI = {
  getCombined: () => api.get('/stats')
};

// ✅ AI
export const aiAPI = {
  getSuggestions: () => api.get('/ai/suggestions'),
  chat: (message) => api.post('/ai/chat', { message })
};

// ✅ Reports
export const reportsAPI = {
  getWeekly: () => api.get('/reports/weekly'),
  getMonthly: () => api.get('/reports/monthly')
};

// ✅ Mood
export const moodAPI = {
  create: (data) => api.post('/mood', data),
  getAll: (params) => api.get('/mood', { params }),
  getInsights: () => api.get('/mood/insights')
};

// ✅ Collaboration
export const collaborationAPI = {
  shareTask: (taskId, data) => api.post(`/collaboration/tasks/${taskId}/share`, data),
  shareHabit: (habitId, data) => api.post(`/collaboration/habits/${habitId}/share`, data),
  getSharedTasks: () => api.get('/collaboration/tasks/shared'),
  getSharedHabits: () => api.get('/collaboration/habits/shared'),
  removeCollaborator: (taskId, userId) =>
    api.delete(`/collaboration/tasks/${taskId}/collaborators/${userId}`)
};

// ✅ Leaderboard
export const leaderboardAPI = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
  updateScore: (data) => api.post('/leaderboard/update', data)
};

// ✅ 2FA
export const twoFactorAPI = {
  generateOTP: (email) => api.post('/2fa/generate-otp', { email }),
  enable: () => api.post('/2fa/enable'),
  disable: () => api.post('/2fa/disable'),
  verifyOTP: (email, otp) => api.post('/2fa/verify-otp', { email, otp })
};

// ✅ Calendar
export const calendarAPI = {
  getAuthUrl: () => api.get('/calendar/auth-url'),
  sync: () => api.post('/calendar/sync'),
  disconnect: () => api.post('/calendar/disconnect')
};

// ✅ Backup
export const backupAPI = {
  export: () => api.get('/backup/export'),
  import: (data) => api.post('/backup/import', { backupData: data })
};

// ✅ Templates
export const templatesAPI = {
  getAll: () => api.get('/templates'),
  apply: (templateId) => api.post(`/templates/${templateId}/apply`),
  initialize: () => api.post('/templates/initialize')
};

// ✅ Gamification
export const gamificationAPI = {
  getStats: () => api.get('/gamification/stats'),
  awardXP: (data) => api.post('/gamification/award-xp', data)
};

// ✅ Location
export const locationAPI = {
  getNearby: (params) => api.get('/location/nearby', { params }),
  updateHomeLocation: (data) => api.post('/location/home-location', data)
};

export default api;
