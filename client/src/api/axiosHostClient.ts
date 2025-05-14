import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const axiosHostClient = axios.create({
  baseURL: `${API_URL}/api/hosts`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosHostClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);


axiosHostClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosHostClient.post("/refresh-token");
        return axiosHostClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosHostClient;
