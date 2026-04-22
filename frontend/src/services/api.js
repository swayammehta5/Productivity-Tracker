import axios from 'axios';
import { toast } from 'react-toastify';

// Configure API base URL - REACT_APP_API_URL must be set in production (Render env vars)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 seconds - increased for Render deployment
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
    
    // Handle network errors and timeouts
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Request timeout. The server is taking too long to respond. Please try again.');
      } else {
        toast.error('Network error. Please check your connection.');
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Handle 401 Unauthorized - clear auth and redirect to login
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
      return Promise.reject(error);
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

// ✅ CALENDAR
export const calendarAPI = {
  getDayDetails: (params) => api.get('/calendar/day-details', { params })
};

// ✅ Stats
export const statsAPI = {
  getCombined: () => api.get('/stats')
};

// ✅ Reports
export const reportsAPI = {
  getWeekly: () => api.get('/reports/weekly'),
  getMonthly: () => api.get('/reports/monthly')
};

// ✅ AI Assistant
export const aiAPI = {
  getHabitCoach: () => api.get('/ai/habit-coach'),
  getTaskPrioritization: () => api.get('/ai/task-prioritize'),
  getWeeklyInsights: () => api.get('/ai/weekly-insights'),
  askAssistant: (question) => api.post('/ai/assistant', { question })
};

// ✅ Leaderboard
export const leaderboardAPI = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
  updateScore: (data) => api.post('/leaderboard/update', data)
};

// ✅ Gamification
export const gamificationAPI = {
  getStats: () => api.get('/gamification/stats'),
  awardXP: (data) => api.post('/gamification/award-xp', data)
};

export default api;
