import axios from "axios";
import {
  ADMIN_TOKEN_KEY,
  ADMIN_USER_KEY,
  MEMBER_TOKEN_KEY,
  MEMBER_USER_KEY,
  getActiveToken,
} from "./auth";

const API_BASE_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getActiveToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const path = window.location.pathname;

    if (status === 401) {
      if (path.startsWith("/admin")) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
      } else if (path.startsWith("/member")) {
        localStorage.removeItem(MEMBER_TOKEN_KEY);
        localStorage.removeItem(MEMBER_USER_KEY);
      }
    }

    return Promise.reject(error);
  }
);

export default api;