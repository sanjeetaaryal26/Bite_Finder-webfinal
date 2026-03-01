"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import api, { setAccessToken, getAccessToken } from "@/lib/api";
import { useEffect } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  createdAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<AuthUser | null>;
  updateProfile: (payload: { name?: string; profileImage?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state: try stored access token, else try refresh cookie
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = getAccessToken();
        if (t) {
          setToken(t);
          setAccessToken(t);
          try {
            const { data } = await api.get("/auth/me");
            if (!mounted) return;
            setUser(data.data);
            setLoading(false);
            return;
          } catch (err) {
            // fallthrough to try refresh
          }
        }

        // attempt refresh using refresh cookie
        try {
          const { data } = await api.get("/auth/refresh", { withCredentials: true });
          if (!mounted) return;
          const at = data.data.accessToken;
          setToken(at);
          setAccessToken(at);
          setUser(data.data.user);
        } catch (err) {
          setUser(null);
          setToken(null);
          try { setAccessToken(null); } catch (e) {}
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAuthSuccess = (token: string, nextUser: AuthUser) => {
    setToken(token);
    setAccessToken(token);
    setUser(nextUser);
  };

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/login", payload);
        handleAuthSuccess(data.data.accessToken, data.data.user);
        router.replace("/dashboard");
      } catch (error: any) {
        const message = error?.response?.data?.message || "Login failed";
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const signup = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/signup", payload);
        handleAuthSuccess(data.data.accessToken, data.data.user);
        router.replace("/dashboard");
      } catch (error: any) {
        const message = error?.response?.data?.message || "Signup failed";
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAccessToken(null);
    router.replace("/login");
  }, [router]);

  const checkAuth = useCallback(async () => {
    if (!accessToken) return null;
    setLoading(true);
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
      return data.data as AuthUser;
    } catch (error) {
      setUser(null);
      setToken(null);
      setAccessToken(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const updateProfile = useCallback(
    async (payload: { name?: string; profileImage?: string }) => {
      const { data } = await api.patch("/auth/me", payload);
      setUser(data.data as AuthUser);
    },
    []
  );

  const value = useMemo(
    () => ({ user, accessToken, loading, login, signup, logout, checkAuth, updateProfile }),
    [user, accessToken, loading, login, signup, logout, checkAuth, updateProfile]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
