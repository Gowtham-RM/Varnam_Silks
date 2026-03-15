import axios from 'axios';

const normalizeApiBaseUrl = (url?: string) => {
    if (!url) return undefined;

    const trimmed = url.trim().replace(/\/+$/, '');
    if (!trimmed) return undefined;

    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const configuredApiUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
const apiBaseUrl = configuredApiUrl || (import.meta.env.PROD
    ? 'https://varnam-silks.onrender.com/api'
    : '/api');

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
