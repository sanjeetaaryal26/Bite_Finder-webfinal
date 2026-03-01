import axios from "axios";

let accessToken: string | null = null;
const STORAGE_KEY = "bf_access_token";

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  try {
    if (typeof window !== "undefined") {
      if (token) window.localStorage.setItem(STORAGE_KEY, token);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    // ignore localStorage errors
  }
  try {
    // set axios default header so requests made outside the interceptor include it
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
  } catch (e) {
    // api may not be initialized yet — ignore
  }
};

export const getAccessToken = () => {
  if (accessToken) return accessToken;
  try {
    if (typeof window !== "undefined") {
      const t = window.localStorage.getItem(STORAGE_KEY);
      accessToken = t;
      return t;
    }
  } catch (e) {
    // ignore localStorage errors
  }
  return null;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401 try refresh once and retry the original request
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    const status = error.response?.status;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(`${api.defaults.baseURL}/auth/refresh`, { withCredentials: true });
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        // refresh failed, fall through to reject
      }
    }
    return Promise.reject(error);
  }
);

export default api;
