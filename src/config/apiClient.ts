import axios from "axios";
import Cookies from "js-cookie"; // opcional si usas cookies

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// interceptor que se ejecuta antes de cada request
apiClient.interceptors.request.use((config) => {
  // 1️⃣ lee token
  const token = localStorage.getItem("authToken") ?? Cookies.get("authToken");

  // 2️⃣ si existe, lo añade
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
