import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

export const projectAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
};

export const memberAPI = {
    getAll: (projectId) => api.get(`/projects/${projectId}/members`),
    add: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
    updateRole: (projectId, memberId, data) => api.put(`/projects/${projectId}/members/${memberId}`, data),
    remove: (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}`),
};

export const columnAPI = {
    getAll: (projectId) => api.get(`/projects/${projectId}/columns`),
    create: (projectId, data) => api.post(`/projects/${projectId}/columns`, data),
    update: (projectId, columnId, data) => api.put(`/projects/${projectId}/columns/${columnId}`, data),
    delete: (projectId, columnId) => api.delete(`/projects/${projectId}/columns/${columnId}`),
    reorder: (projectId, data) => api.post(`/projects/${projectId}/columns/reorder`, data),
};

export const taskAPI = {
    create: (columnId, data) => api.post(`/columns/${columnId}/tasks`, data),
    getById: (id) => api.get(`/tasks/${id}`),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
    reorder: (data) => api.post('/tasks/reorder', data),
};

export const dashboardAPI = {
    get: () => api.get('/dashboard'),
};

export default api;
