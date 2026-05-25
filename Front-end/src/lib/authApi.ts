import { apiRequest } from "./apiClient";
import type { User } from "./types";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

type RegisterResponse = {
  user_id: number;
  message: string;
};

export function authRegister(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>({
    method: "POST",
    path: "/auth/register",
    body: payload,
    auth: false,
  });
}

export function authVerifyEmail(payload: { user_id: number; code: string }) {
  return apiRequest<AuthResponse>({
    method: "POST",
    path: "/auth/verify-email",
    body: payload,
    auth: false,
  });
}

export function authResendCode(payload: { user_id: number }) {
  return apiRequest<{ message: string }>({
    method: "POST",
    path: "/auth/resend-code",
    body: payload,
    auth: false,
  });
}

export function authLogin(payload: LoginPayload) {
  return apiRequest<AuthResponse>({
    method: "POST",
    path: "/auth/login",
    body: payload,
    auth: false,
  });
}

export function authLogout() {
  return apiRequest<{ message: string }>({
    method: "POST",
    path: "/auth/logout",
    body: null,
  });
}

export function authUser() {
  return apiRequest<{ message: string; data: User }>({
    method: "GET",
    path: "/auth/user",
  });
}
