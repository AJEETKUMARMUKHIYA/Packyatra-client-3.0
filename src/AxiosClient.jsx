// src/utils/axiosClient.js or wherever your file is
import axios from "axios";

const AxiosClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api",
});

// Add global headers
AxiosClient.interceptors.request.use((config) => {
  // You can add authentication tokens here
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Optional: Add response interceptor for error handling
AxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userID");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default AxiosClient;