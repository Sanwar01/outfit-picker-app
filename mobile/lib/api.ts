import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

function resolveApiBaseUrl(): string {
  // Android emulator can't reach host machine via localhost.
  if (
    Platform.OS === 'android' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_URL)
  ) {
    return API_URL.replace(/localhost|127\.0\.0\.1/i, '10.0.2.2');
  }
  return API_URL;
}

const API_BASE = resolveApiBaseUrl();

function networkErrorMessage(path: string): string {
  return `Network error calling ${API_BASE}${path}. Check EXPO_PUBLIC_API_URL (use LAN IP on physical device).`;
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: await authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Request failed' };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    console.error('API POST network error:', { path, apiBase: API_BASE, error });
    return { ok: false, error: networkErrorMessage(path) };
  }
}

export async function apiGet<T>(
  path: string,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: await authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Request failed' };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    console.error('API GET network error:', { path, apiBase: API_BASE, error });
    return { ok: false, error: networkErrorMessage(path) };
  }
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Request failed' };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    console.error('API PATCH network error:', { path, apiBase: API_BASE, error });
    return { ok: false, error: networkErrorMessage(path) };
  }
}

export async function apiDelete(
  path: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.error ?? 'Request failed' };
    }
    return { ok: true };
  } catch (error) {
    console.error('API DELETE network error:', { path, apiBase: API_BASE, error });
    return { ok: false, error: networkErrorMessage(path) };
  }
}
