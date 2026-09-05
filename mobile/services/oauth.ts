import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "apple";

/**
 * Deep link used after OAuth, email confirmation, and password reset.
 * Must be allow-listed in Supabase Auth → URL Configuration.
 */
export function getAuthRedirectUrl(path = "auth/callback") {
  return makeRedirectUri({
    scheme: "outfitpicker",
    path,
  });
}

/** @deprecated Prefer getAuthRedirectUrl */
export function getOAuthRedirectUrl() {
  return getAuthRedirectUrl();
}

export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(
      typeof errorCode === "string"
        ? decodeURIComponent(errorCode.replace(/\+/g, " "))
        : "Authentication failed.",
    );
  }

  const errorDescription = params.error_description ?? params.error;
  if (errorDescription) {
    throw new Error(
      decodeURIComponent(String(errorDescription).replace(/\+/g, " ")),
    );
  }

  const tokenHash = params.token_hash;
  const type = params.type as EmailOtpType | undefined;
  if (typeof tokenHash === "string" && tokenHash.length > 0 && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) throw error;
    return;
  }

  const code = params.code;
  if (typeof code === "string" && code.length > 0) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  if (
    typeof accessToken === "string" &&
    accessToken.length > 0 &&
    typeof refreshToken === "string" &&
    refreshToken.length > 0
  ) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return;
  }

  throw new Error("Couldn't finish authentication. Please try again.");
}

/**
 * Starts Google/Apple OAuth in an in-app browser and exchanges the result
 * for a Supabase session. Returns whether the user completed sign-in.
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
): Promise<"signed_in" | "cancelled"> {
  const redirectTo = getAuthRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams:
        provider === "google"
          ? {
              access_type: "offline",
              prompt: "select_account",
            }
          : undefined,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("Unable to start social login.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !result.url) {
    return "cancelled";
  }

  await createSessionFromUrl(result.url);
  return "signed_in";
}
