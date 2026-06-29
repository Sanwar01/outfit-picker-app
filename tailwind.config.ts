import type { Config } from "tailwindcss";
import { colors, fonts, radius } from "./lib/design/tokens";

const config = {
  theme: {
    extend: {
      colors: {
        page: colors.page,
        cream: colors.cream,
        "cream-deep": colors.creamDeep,
        surface: colors.surface,
        "surface-hover": colors.surfaceHover,
        ink: colors.ink,
        "ink-muted": colors.inkMuted,
        "ink-faint": colors.inkFaint,
        brand: {
          DEFAULT: colors.brand,
          hover: colors.brandHover,
          subtle: colors.brandSubtle,
        },
        "border-strong": colors.borderStrong,
        background: colors.page,
        foreground: colors.ink,
        card: {
          DEFAULT: colors.surface,
          foreground: colors.ink,
        },
        popover: {
          DEFAULT: colors.surface,
          foreground: colors.ink,
        },
        primary: {
          DEFAULT: colors.ink,
          foreground: colors.primaryForeground,
        },
        secondary: {
          DEFAULT: colors.cream,
          foreground: colors.ink,
        },
        muted: {
          DEFAULT: colors.cream,
          foreground: colors.inkMuted,
        },
        accent: {
          DEFAULT: colors.cream,
          foreground: colors.ink,
        },
        destructive: colors.destructive,
        border: colors.border,
        input: colors.borderInput,
        ring: colors.brand,
      },
      fontFamily: {
        sans: [fonts.sans],
        serif: [fonts.serif],
        mono: [fonts.mono],
        heading: [fonts.serif],
      },
      borderRadius: {
        lg: radius,
        md: `calc(${radius} * 0.8)`,
        sm: `calc(${radius} * 0.6)`,
        xl: `calc(${radius} * 1.4)`,
        "2xl": `calc(${radius} * 1.8)`,
        "3xl": `calc(${radius} * 2.2)`,
        "4xl": `calc(${radius} * 2.6)`,
      },
    },
  },
} satisfies Config;

export default config;
