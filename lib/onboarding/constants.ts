import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Calendar,
  Clock,
  Layers,
  Shirt,
  Sparkles,
  Star,
  Luggage,
  Tag,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import type { StyleVibe } from "@/lib/types/clothing";

export const ONBOARDING_STEPS = 4;

export const STYLE_VIBE_OPTIONS: {
  id: StyleVibe;
  label: string;
  imageClass: string;
}[] = [
  { id: "Minimal", label: "Minimal", imageClass: "bg-[#d8d2c8]" },
  { id: "Classic", label: "Classic", imageClass: "bg-[#2a2a2a]" },
  { id: "Casual", label: "Casual", imageClass: "bg-[#8fa3b0]" },
  { id: "Streetwear", label: "Streetwear", imageClass: "bg-[#4a4a4a]" },
  { id: "Smart casual", label: "Smart Casual", imageClass: "bg-[#c4b5a0]" },
  { id: "Elegant", label: "Elegant", imageClass: "bg-[#6b5344]" },
  { id: "Other", label: "Other", imageClass: "bg-[#b8c9b0]" },
];

export type StyleGoalId =
  | "look_better_daily"
  | "save_time"
  | "versatile_wardrobe"
  | "dress_for_work"
  | "dress_for_events"
  | "travel_light"
  | "shop_smarter"
  | "boost_confidence";

export const STYLE_GOAL_OPTIONS: {
  id: StyleGoalId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "look_better_daily", label: "Look better daily", icon: TrendingUp },
  { id: "save_time", label: "Save time", icon: Clock },
  { id: "versatile_wardrobe", label: "Build a versatile wardrobe", icon: Layers },
  { id: "dress_for_work", label: "Dress for work", icon: Briefcase },
  { id: "dress_for_events", label: "Dress for events", icon: Calendar },
  { id: "travel_light", label: "Travel light", icon: Luggage },
  { id: "shop_smarter", label: "Shop smarter", icon: Tag },
  { id: "boost_confidence", label: "Boost confidence", icon: Star },
];

export type OnboardingAudience = "self" | "other";

export const AUDIENCE_OPTIONS: {
  id: OnboardingAudience;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "self",
    label: "Me",
    description: "It's for my personal use",
    icon: User,
  },
  {
    id: "other",
    label: "Someone else",
    description: "I'm helping a friend or family member",
    icon: Users,
  },
];

export const WARDROBE_TIPS = [
  {
    icon: Sparkles,
    title: "Good lighting",
    body: "Use natural light when possible.",
  },
  {
    icon: Shirt,
    title: "Clear background",
    body: "A plain background works best.",
  },
  {
    icon: Shirt,
    title: "One item at a time",
    body: "Each photo should focus on one item.",
  },
  {
    icon: Shirt,
    title: "Include variety",
    body: "Add tops, bottoms, shoes & more.",
  },
] as const;

export const WARDROBE_CATEGORIES = [
  { id: "top", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "shoes", label: "Shoes" },
  { id: "accessory", label: "Accessories" },
] as const;
