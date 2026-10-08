import axios from "axios";

// Default to the API on whichever host served this page, so LAN visitors reach the store laptop
// directly (and the API sees their real IP) instead of their own localhost.
const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every outgoing request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralized handling for expired/invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong. Please try again.";

export default api;
