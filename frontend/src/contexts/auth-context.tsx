"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient } from "@/lib/api-client";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/lib/auth-types";
import { setAccessToken } from "@/lib/token-store";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthResponse = useCallback((data: AuthResponse) => {
    setAccessToken(data.access_token);
    setUser(data.user);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/refresh");
      applyAuthResponse(response.data);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthResponse]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await apiClient.post<AuthResponse>("/auth/login", payload);
      applyAuthResponse(response.data);
      router.push("/dashboard");
    },
    [applyAuthResponse, router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        payload,
      );
      applyAuthResponse(response.data);
      router.push("/dashboard");
    },
    [applyAuthResponse, router],
  );

  const logout = useCallback(async () => {
    await apiClient.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshSession,
    }),
    [isLoading, login, logout, refreshSession, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
