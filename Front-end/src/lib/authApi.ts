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

export function authRegister(payload: RegisterPayload) {
  return apiRequest<AuthResponse>({
    method: "POST",
    path: "/auth/register",
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
