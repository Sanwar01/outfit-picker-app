export type AppPlatform = "ios" | "android" | "both";

export type AppLinks = {
  ios: string | null;
  android: string | null;
};

function readUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getAppLinks(): AppLinks {
  return {
    ios: readUrl(process.env.NEXT_PUBLIC_IOS_APP_URL),
    android: readUrl(process.env.NEXT_PUBLIC_ANDROID_APP_URL),
  };
}
