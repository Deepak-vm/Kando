import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

export const boardAPI = {
    getAll: () => api.get('/board'),
    getById: (id) => api.get(`/board/${id}`),
    create: (data) => api.post('/board', data),
    update: (id, data) => api.put(`/board/${id}`, data),
    delete: (id) => api.delete(`/board/${id}`),
};

export const columnAPI = {
    getAll: (boardId) => api.get(`/boards/${boardId}/columns`),
    create: (boardId, data) => api.post(`/boards/${boardId}/columns`, data),
    update: (id, data) => api.put(`/columns/${id}`, data),
    delete: (id) => api.delete(`/columns/${id}`),
};

export const taskAPI = {
    getAll: (columnId) => api.get(`/columns/${columnId}/tasks`),
    create: (columnId, data) => api.post(`/columns/${columnId}/tasks`, data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
};

export default api;