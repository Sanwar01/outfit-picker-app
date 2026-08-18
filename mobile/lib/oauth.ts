import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

function readParam(url: string, key: string): string | null {
  const fromQuery = Linking.parse(url).queryParams?.[key];
  if (typeof fromQuery === "string") return fromQuery;

  const hash = url.split("#")[1];
  if (!hash) return null;
  return new URLSearchParams(hash).get(key);
}

export async function signInWithOAuth(provider: "google" | "apple") {
  const redirectTo = Linking.createURL("/auth/callback");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("Unable to start social login.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return;

  const code = readParam(result.url, "code");
  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return;
  }

  const accessToken = readParam(result.url, "access_token");
  const refreshToken = readParam(result.url, "refresh_token");
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
  }
}
