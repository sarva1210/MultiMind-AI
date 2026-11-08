import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Attach JWT token to protected requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const registerUser = async (userData) => {
    const response = await api.post("/api/auth/register", userData);

    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }

    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);

    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }

    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
};

export const logoutUser = async () => {
    localStorage.removeItem("token");
};

export default api;