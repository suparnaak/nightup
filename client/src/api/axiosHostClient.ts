import axios from "axios";

const axiosHostClient = axios.create({
  baseURL: "/api/hosts",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosHostClient;
