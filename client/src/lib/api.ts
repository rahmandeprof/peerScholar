import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
    timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle specific error cases
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data as { message?: string; errors?: unknown };

            switch (status) {
                case 401:
                    // Unauthorized - redirect to login when auth is implemented
                    console.error('Unauthorized access');
                    break;
                case 403:
                    console.error('Forbidden access');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
            }

            // Return structured error
            return Promise.reject({
                message: data?.message || 'An error occurred',
                status,
                errors: data?.errors,
            });
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                message: 'No response from server. Please check your connection.',
                status: 0,
            });
        } else {
            // Error in request setup
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0,
            });
        }
    }
);

export default api;
