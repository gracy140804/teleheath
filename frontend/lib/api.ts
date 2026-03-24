import axios from 'axios';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/?$/, '/');

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Let Axios auto-set Content-Type for FormData (multipart/form-data with boundary)
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 Unauthenticated globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Avoid infinite loop if we're already on login/register
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_role');
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
