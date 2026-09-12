import { apiFetch } from "./client";
import type { User } from "../types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(
  payload: LoginPayload
): Promise<AuthResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<AuthResponse> {
  return apiFetch("/auth/me", {
    method: "GET",
  });
}

export async function logout(): Promise<{ success: boolean; message?: string }> {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}