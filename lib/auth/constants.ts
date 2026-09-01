export const REMEMBER_EMAIL_KEY = "wardrobe_remember_email";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getAuthCallbackUrl(next = "/"): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
