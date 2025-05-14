import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const axiosAdminClient = axios.create({
  baseURL:`${API_URL}/api/admin`, 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});


axiosAdminClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);


axiosAdminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosAdminClient.post("/refresh-token");
        return axiosAdminClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosAdminClient;
