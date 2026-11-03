import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Base URL for the FashionTally backend.
 * Change this to your production URL before deploying.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://backend.fashiontally.com/api";

export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_USER_KEY = "authUser";

/** Save JWT + user object to AsyncStorage after login */
export async function saveSession(token: string, user: object): Promise<void> {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, token],
    [AUTH_USER_KEY, JSON.stringify(user)],
  ]);
}

/** Clear JWT + user from AsyncStorage on logout */
export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

let onUnauthorized: (() => void) | null = null;

/** Called once from auth so an expired token clears the signed-in user. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export function isTokenExpired(token: string): boolean {
  try {
    const part = token.split(".")[1];
    if (!part || typeof globalThis.atob !== "function") return false;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = JSON.parse(globalThis.atob(padded));
    if (typeof json.exp !== "number") return false;
    return json.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

/** Read the stored JWT */
export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

/** Read the stored user object */
export async function getStoredUser<T = unknown>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Thin fetch wrapper that automatically attaches the Bearer token.
 * Throws an Error whose message comes from the backend `error` field
 * when success === false.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getStoredToken();

  if (token && isTokenExpired(token)) {
    await clearSession();
    onUnauthorized?.();
    throw new ApiError("Invalid or expired token", 401);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = `${API_BASE_URL}${path}`;
  console.log("[apiFetch]", options.method ?? "GET", fullUrl);
  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    const message = data.error ?? `Request failed (${res.status})`;
    const sessionRejected = res.status === 401 && /token/i.test(String(message));
    if (sessionRejected) {
      await clearSession();
      onUnauthorized?.();
      throw new ApiError(message, 401);
    }
    throw new Error(message);
  }

  return data as T;
}
