import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "apple";

/** Redirect used by Supabase after Google/Apple consent. Must be allow-listed. */
export function getOAuthRedirectUrl() {
  return makeRedirectUri({
    scheme: "outfitpicker",
    path: "auth/callback",
  });
}

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(
      typeof errorCode === "string"
        ? decodeURIComponent(errorCode.replace(/\+/g, " "))
        : "Social login failed.",
    );
  }

  const errorDescription = params.error_description ?? params.error;
  if (errorDescription) {
    throw new Error(
      decodeURIComponent(String(errorDescription).replace(/\+/g, " ")),
    );
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

  throw new Error("Couldn't finish social login. Please try again.");
}

/**
 * Starts Google/Apple OAuth in an in-app browser and exchanges the result
 * for a Supabase session. Returns whether the user completed sign-in.
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
): Promise<"signed_in" | "cancelled"> {
  const redirectTo = getOAuthRedirectUrl();

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
