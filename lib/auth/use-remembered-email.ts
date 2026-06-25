import { useSyncExternalStore } from "react";
import { REMEMBER_EMAIL_KEY } from "@/lib/auth/constants";

const REMEMBER_EMAIL_EVENT = "remember-email-change";

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(REMEMBER_EMAIL_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(REMEMBER_EMAIL_EVENT, handler);
  };
}

function getRememberedEmailSnapshot(): string {
  return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
}

export function useRememberedEmail(): string {
  return useSyncExternalStore(
    subscribe,
    getRememberedEmailSnapshot,
    () => ""
  );
}

export function writeRememberedEmail(email: string | null): void {
  if (email) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
  window.dispatchEvent(new Event(REMEMBER_EMAIL_EVENT));
}
