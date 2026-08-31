import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

function metroHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(":")[0] ?? null;
}

function resolveApiBaseUrl(): string {
  const envUrl = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const port = envUrl.match(/:(\d+)$/)?.[1] ?? "3000";

  if (/^https:\/\//i.test(envUrl)) return envUrl;

  const host = metroHost();
  if (host) {
    const isEmulatorLoopback =
      host === "localhost" || host === "127.0.0.1" || host === "10.0.2.2";
    if (Platform.OS === "android" && isEmulatorLoopback) {
      return `http://10.0.2.2:${port}`;
    }
    return `http://${host}:${port}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${port}`;
  }

  return envUrl;
}

function networkErrorMessage(path: string, apiBase: string): string {
  return `Network error calling ${apiBase}${path}. Is the Next.js API running on port 3000?`;
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const apiBase = resolveApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: await authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    console.error("API POST network error:", { path, apiBase, error });
    return { ok: false, error: networkErrorMessage(path, apiBase) };
  }
}

export async function apiGet<T>(
  path: string,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const apiBase = resolveApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}${path}`, {
      headers: await authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    console.error("API GET network error:", { path, apiBase, error });
    return { ok: false, error: networkErrorMessage(path, apiBase) };
  }
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const apiBase = resolveApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    console.error("API PATCH network error:", { path, apiBase, error });
    return { ok: false, error: networkErrorMessage(path, apiBase) };
  }
}

export async function apiDelete(
  path: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiBase = resolveApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("API DELETE network error:", { path, apiBase, error });
    return { ok: false, error: networkErrorMessage(path, apiBase) };
  }
}
