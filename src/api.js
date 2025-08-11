import axios from 'axios';

const apiClient = axios.create({
    // Use import.meta.env for Vite environment variables
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor to add the auth token to every request header
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, 
    error => {
        return Promise.reject(error);
    }
);

// Interceptor to handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // If token is invalid or expired, log the user out
            localStorage.removeItem('token');
            window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;