import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api/users', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // important for sending cookies!
});

export default axiosClient;
