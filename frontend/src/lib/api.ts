import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; username: string; full_name: string; password: string; niche?: string }) =>
    api.post('/api/v1/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', data),
  me: () => api.get('/api/v1/auth/me'),
  logout: () => api.post('/api/v1/auth/logout'),
};

// ── Analytics ─────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () => api.get('/api/v1/analytics/overview'),
  platform: (platform: string, days = 30) =>
    api.get(`/api/v1/analytics/platform/${platform}?days=${days}`),
};

// ── Posts ─────────────────────────────────────────────────────────────────
export const postsApi = {
  list: (status?: string) =>
    api.get(`/api/v1/posts${status ? `?status=${status}` : ''}`),
  create: (data: object) => api.post('/api/v1/posts', data),
  publish: (id: string) => api.post(`/api/v1/posts/${id}/publish`),
  delete: (id: string) => api.delete(`/api/v1/posts/${id}`),
};

// ── AI ────────────────────────────────────────────────────────────────────
export const aiApi = {
  feedback: (data: { caption: string; platforms: string[]; hashtags: string[] }) =>
    api.post('/api/v1/ai/feedback', data),
  growthTips: () => api.get('/api/v1/ai/growth-tips'),
  trendingHashtags: () => api.get('/api/v1/ai/trending-hashtags'),
};

// ── Brand Collabs ─────────────────────────────────────────────────────────
export const brandApi = {
  list: (stage?: string) =>
    api.get(`/api/v1/brand-collabs${stage ? `?stage=${stage}` : ''}`),
  create: (data: object) => api.post('/api/v1/brand-collabs', data),
  update: (id: string, data: object) => api.patch(`/api/v1/brand-collabs/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/brand-collabs/${id}`),
  discover: () => api.get('/api/v1/brand-collabs/discover'),
};

// ── Alerts ────────────────────────────────────────────────────────────────
export const alertsApi = {
  list: (unreadOnly = false) =>
    api.get(`/api/v1/alerts?unread_only=${unreadOnly}`),
  markRead: (id: string) => api.patch(`/api/v1/alerts/${id}/read`),
  markAllRead: () => api.post('/api/v1/alerts/read-all'),
};

// ── Social ────────────────────────────────────────────────────────────────
export const socialApi = {
  accounts: () => api.get('/api/v1/social/accounts'),
};

// ── User update ───────────────────────────────────────────────────────────
export const userApi = {
  update: (data: { full_name?: string; username?: string; niche?: string; bio?: string }) =>
    api.patch('/api/v1/auth/me', data),
};
