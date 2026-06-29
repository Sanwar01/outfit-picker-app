/** Edit brand colors here — consumed by tailwind.config.ts */
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
  destructive: "oklch(0.577 0.245 27.325)",
} as const;

/** Font variables are set on <html> in app/layout.tsx */
export const fonts = {
  sans: "var(--font-auth-sans)",
  serif: "var(--font-auth-serif)",
  mono: "var(--font-geist-mono)",
} as const;

export const radius = "0.75rem";
