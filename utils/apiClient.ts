import axios from 'axios';

// API Base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Usar variables de entorno

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Interceptor para agregar el token desde localStorage
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem('auth_token') : process.env.FRONTEND_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default apiClient;
