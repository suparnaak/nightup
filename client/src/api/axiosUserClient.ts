import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
  baseURL: `${API_URL}/api/users`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);


axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosClient.post("/refresh-token");
        return axiosClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

/* import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for user API requests
const axiosClient = axios.create({
  baseURL: `${API_URL}/api/user`, // Make sure this path is correct for user endpoints
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/auth
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // You can add any request modifications here (like adding tokens)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with refresh token logic
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is due to an expired token (401) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Make sure this endpoint is correct for user refresh token
        await axiosClient.post("/refresh-token");
        // Retry the original request with new token
        return axiosClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient; */