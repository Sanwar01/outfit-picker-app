/** Mirrors lib/design/tokens.ts — edit both or extract to packages/shared later */
export const colors = {
  page: "#f9f8f6",
  cream: "#f4efe6",
  creamDeep: "#efe1d5",
  surface: "#ffffff",
  surfaceHover: "#faf8f5",
  ink: "#1a1a1a",
  inkMuted: "#6b6560",
  inkFaint: "#a39e97",
  brand: "#8b7355",
  brandHover: "#735f47",
  brandSubtle: "#efe1d5",
  border: "#ebe4d8",
  borderStrong: "#d8d0c4",
  borderInput: "#e8e2d9",
  primaryForeground: "#ffffff",
  destructive: "#dc2626",
} as const;

export const spacing = {
  screen: 16,
  cardRadius: 16,
  tabBarHeight: 64,
} as const;

export const radius = {
  sheet: 32,
  button: 16,
  input: 16,
  tile: 16,
  logo: 16,
} as const;

export const fonts = {
  serif: "InstrumentSerif_400Regular",
  sans: "DMSans_400Regular",
  sansMedium: "DMSans_500Medium",
  sansSemi: "DMSans_600SemiBold",
} as const;
