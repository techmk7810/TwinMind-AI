import axios from "axios";
import { getAccessToken, setAccessToken } from "@/lib/token-store";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register");

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshResponse = await apiClient.post("/auth/refresh");
    setAccessToken(refreshResponse.data.access_token);
    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;

    return apiClient(originalRequest);
  },
);
