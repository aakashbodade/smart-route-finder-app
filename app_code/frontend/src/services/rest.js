// services/hubService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust this to your backend URL

// Create axios instance with default config
export  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
);
