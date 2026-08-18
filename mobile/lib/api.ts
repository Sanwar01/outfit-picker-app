import { supabase } from "@/lib/supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: await authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Network error — check EXPO_PUBLIC_API_URL" };
  }
}

export async function apiGet<T>(
  path: string,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: await authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Network error — check EXPO_PUBLIC_API_URL" };
  }
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export async function apiDelete(
  path: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.error ?? "Request failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error" };
  }
}
