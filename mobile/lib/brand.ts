/** Placeholder brand — swap name, tagline, and copy here. */
export const brand = {
  name: "Wardrobe",
  tagline: "WEAR BETTER. EVERY DAY.",
  loginHeadline: "Your wardrobe,\nsmarter every day.",
  loginSubheadline: "Get personalized outfit ideas from what you already own.",
  signupHeadline: "Create your account",
  signupSubheadline: "Start building a smarter wardrobe that works for you.",
} as const;

export type AuthFeatureIcon = "shirt" | "sparkles" | "weather";

export const authFeatures: {
  id: string;
  icon: AuthFeatureIcon;
  label: string;
  emphasis: string;
  rest: string;
}[] = [
  {
    id: "organize",
    icon: "shirt",
    label: "Organize\nyour clothes",
    emphasis: "Organize",
    rest: "your clothes",
  },
  {
    id: "outfits",
    icon: "sparkles",
    label: "Get outfits\nyou'll love",
    emphasis: "Get outfits",
    rest: "you'll love",
  },
  {
    id: "weather",
    icon: "weather",
    label: "Daily picks\nfor the weather",
    emphasis: "Daily picks",
    rest: "for the weather",
  },
];
