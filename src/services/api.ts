import axios from "axios";

// Base URL points at the Express API. VITE_API_URL is e.g. http://localhost:5000
const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const TOKEN_KEY = "edu_sphere_token";

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    // config.headers is an AxiosHeaders instance inside interceptors.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise errors so callers get a clean message, and auto-logout on 401.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || error?.message || "Something went wrong";

    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      // Token expired / invalid — clear it. Components/route guards handle redirect.
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
