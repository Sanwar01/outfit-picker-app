/** Placeholder brand — swap name, tagline, and copy here. */
export const brand = {
  name: "Wardrobe",
  tagline: "WEAR BETTER. EVERY DAY.",
  loginHeadline: "Your wardrobe,\nsmarter every day.",
  loginSubheadline: "Get personalized outfit ideas from what you already own.",
  signupHeadline: "Create your account",
  signupSubheadline: "Start building a smarter wardrobe that works for you.",
} as const;

export type WelcomeFeatureIcon = "shirt" | "sparkles" | "weather";

export type WelcomeSlide = {
  id: string;
  headline: string;
  headlineAccent?: string; // chars at end of headline to render in brand colour
  subheadline: string;
  features: {
    id: string;
    icon: WelcomeFeatureIcon;
    title: string;
    body: string;
  }[];
};

export const welcomeSlides: WelcomeSlide[] = [
  {
    id: "main",
    headline: "Your style.",
    headlineAccent: "Simplified.",
    subheadline: "Smart outfit ideas from the clothes you already own.",
    features: [
      {
        id: "organize",
        icon: "shirt",
        title: "Organize your wardrobe",
        body: "Keep all your clothes in one place.",
      },
      {
        id: "outfits",
        icon: "sparkles",
        title: "Get personalized outfits",
        body: "AI-powered looks that match your style, the weather and the occasion.",
      },
      {
        id: "everyday",
        icon: "weather",
        title: "Perfect for every day",
        body: "Daily picks that help you look great without the guesswork.",
      },
    ],
  },
];

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
