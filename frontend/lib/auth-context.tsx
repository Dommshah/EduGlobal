"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken, User } from "@/lib/api";

const TOKEN_KEY = "eduglobal_token";
const USER_KEY = "eduglobal_user";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const persist = useCallback((token: string, u: User) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      document.cookie = `eduglobal_token=${token}; path=/; max-age=86400; samesite=lax`;
    } catch {}
    setAuthToken(token);
    setUser(u);
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const stored = localStorage.getItem(USER_KEY);
      if (token && stored) {
        setAuthToken(token);
        setUser(JSON.parse(stored));
        document.cookie = `eduglobal_token=${token}; path=/; max-age=86400; samesite=lax`;
        api
          .get<User>("/auth/me")
          .then((fresh) => {
            setUser(fresh);
            localStorage.setItem(USER_KEY, JSON.stringify(fresh));
          })
          .catch(() => {
            setUser(null);
            setAuthToken(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            document.cookie = "eduglobal_token=; path=/; max-age=0";
          })
          .finally(() => setLoading(false));
        return;
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      persist(res.token, res.user);
      return res.user;
    },
    [persist]
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      const res = await api.post<{ token: string; user: User }>("/auth/register", { ...data, role: "student" });
      persist(res.token, res.user);
      return res.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = "eduglobal_token=; path=/; max-age=0";
    } catch {}
    setAuthToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  const refresh = useCallback(async () => {
    const fresh = await api.get<User>("/auth/me");
    setUser(fresh);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
