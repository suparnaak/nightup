import axios from "axios";

const axiosAdminClient = axios.create({
  baseURL: "/api/admin", // Adjust as needed for your admin routes
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor: e.g., attach auth token if available
axiosAdminClient.interceptors.request.use(
  (config) => {
    // For example, you might retrieve a token from localStorage:
    // const token = localStorage.getItem("adminToken");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
axiosAdminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling logic here
    return Promise.reject(error);
  }
);

export default axiosAdminClient;
