"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "./types";
import { authLogin, authLogout, authRegister, authUser } from "./authApi";
import { clearAuthToken, getAuthToken, setAuthToken } from "./tokenStorage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  error: string | null;

  signUp: (payload: { name: string; email: string; password: string }) => Promise<User>;
  signIn: (payload: { email: string; password: string }) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();

  async function refreshUser() {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const res = await authUser();
      setUser(res.data);
      setStatus("authenticated");
    } catch (e) {
      clearAuthToken();
      setUser(null);
      setStatus("unauthenticated");
    }
  }

  useEffect(() => {
    void (async () => {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      // If we already consider the user authenticated, don't spam the API.
      if (status === "authenticated") return;

      await refreshUser();
    })();
  }, [pathname, status]);

  async function signIn(payload: { email: string; password: string }) {
    setError(null);
    const res = await authLogin(payload);
    setAuthToken(res.token);
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }

  async function signUp(payload: { name: string; email: string; password: string }) {
    setError(null);
    const res = await authRegister(payload);
    setAuthToken(res.token);
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }

  async function signOut() {
    setError(null);
    try {
      await authLogout();
    } catch {
      // backend might return error if token already expired; still clear client token
    } finally {
      clearAuthToken();
      setUser(null);
      setStatus("unauthenticated");
    }
  }

  const value: AuthContextValue = {
    status,
    user,
    error,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
