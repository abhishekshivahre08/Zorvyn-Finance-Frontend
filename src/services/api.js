import axios from "axios";

const BASE_URL = "https://finances-dashboard.onrender.com";
console.log("API Base URL:", BASE_URL);

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally (auto logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

//AUTHntication APIs 
export const authAPI = {
    login: (data) => api.post("/auth/login", data),
    register: (data) => api.post("/auth/register", data),
    getMe: () => api.get("/auth/me"),
    updatePassword: (data) => api.patch("/auth/update-password", data),
};

// USERSAPIs
export const usersAPI = {
    getAll: (params) => api.get("/users", { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post("/users", data),
    update: (id, data) => api.patch(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get("/users/stats"),
};

// TRANSACTIONS APIs
export const transactionsAPI = {
    getAll: (params) => api.get("/transactions", { params }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post("/transactions", data),
    update: (id, data) => api.patch(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),
    restore: (id) => api.patch(`/transactions/${id}/restore`),
};

//  DASHBOARD APIs
export const dashboardAPI = {
    getSummary: (period = "month") => api.get("/dashboard/summary", { params: { period } }),
    getTrends: (params) => api.get("/dashboard/trends", { params }),
    getCategories: (params) => api.get("/dashboard/categories", { params }),
    getBalance: () => api.get("/dashboard/balance"),
};

export default api;