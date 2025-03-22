import axios from "axios";

const axiosAdminClient = axios.create({
  baseURL: "/api/admin", // Adjust as needed for your admin routes
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ensures cookies are sent
});

// Request interceptor (no need to attach token manually if using cookies)
axiosAdminClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors and call refresh-token endpoint
axiosAdminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if the error response status is 401 and retry has not been attempted yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call the refresh token endpoint. This endpoint should read the refresh token from the cookie
        // and set a new access token cookie.
        await axiosAdminClient.post("/refresh-token");
        // After a successful refresh, retry the original request.
        return axiosAdminClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, reject the promise and handle logout or redirection in your app.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosAdminClient;
