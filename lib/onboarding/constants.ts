import type { LucideIcon } from 'lucide-react';
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
} from 'lucide-react';
import type { StyleVibe } from '@/lib/types/clothing';

export const ONBOARDING_STEPS = 4;

export const STYLE_VIBE_OPTIONS: {
  id: StyleVibe;
  label: string;
  imageUrl: string;
}[] = [
  {
    id: 'Minimal',
    label: 'Minimal',
    imageUrl: '/onboarding/minimal-style.png',
  },
  {
    id: 'Classic',
    label: 'Classic',
    imageUrl: '/onboarding/classic-style.png',
  },
  {
    id: 'Casual',
    label: 'Casual',
    imageUrl: '/onboarding/casual-style.png',
  },
  {
    id: 'Streetwear',
    label: 'Streetwear',
    imageUrl: '/onboarding/streetwear-style.png',
  },
  {
    id: 'Smart casual',
    label: 'Smart Casual',
    imageUrl: '/onboarding/smart-casual-style.png',
  },
  {
    id: 'Elegant',
    label: 'Elegant',
    imageUrl: '/onboarding/elegant-style.png',
  },
];

export type StyleGoalId =
  | 'look_better_daily'
  | 'save_time'
  | 'versatile_wardrobe'
  | 'dress_for_work'
  | 'dress_for_events'
  | 'travel_light'
  | 'shop_smarter'
  | 'boost_confidence';

export const STYLE_GOAL_OPTIONS: {
  id: StyleGoalId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'look_better_daily', label: 'Look better daily', icon: TrendingUp },
  { id: 'save_time', label: 'Save time', icon: Clock },
  { id: 'dress_for_work', label: 'Dress for work', icon: Briefcase },
  { id: 'dress_for_events', label: 'Dress for events', icon: Calendar },
  { id: 'travel_light', label: 'Travel light', icon: Luggage },
  { id: 'shop_smarter', label: 'Shop smarter', icon: Tag },
  {
    id: 'versatile_wardrobe',
    label: 'Build a versatile wardrobe',
    icon: Layers,
  },
  { id: 'boost_confidence', label: 'Boost confidence', icon: Star },
];

export type OnboardingAudience = 'self' | 'other';

export const AUDIENCE_OPTIONS: {
  id: OnboardingAudience;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'self',
    label: 'Me',
    description: "It's for my personal use",
    icon: User,
  },
  {
    id: 'other',
    label: 'Someone else',
    description: "I'm helping a friend or family member",
    icon: Users,
  },
];

export const WARDROBE_TIPS = [
  {
    icon: Sparkles,
    title: 'Good lighting',
    body: 'Use natural light when possible.',
  },
  {
    icon: Shirt,
    title: 'Clear background',
    body: 'A plain background works best.',
  },
  {
    icon: Shirt,
    title: 'Include variety',
    body: 'Add tops, bottoms, shoes & more.',
  },
] as const;

export const WARDROBE_CATEGORIES = [
  { id: 'top', label: 'Tops', imageUrl: '/upload/tops.png' },
  {
    id: 'bottom',
    label: 'Bottoms',
    imageUrl: '/upload/bottoms.png',
  },
  {
    id: 'outerwear',
    label: 'Outerwear',
    imageUrl: '/upload/outerwear.png',
  },
  { id: 'shoes', label: 'Shoes', imageUrl: '/upload/shoes.png' },
  {
    id: 'accessory',
    label: 'Accessories',
    imageUrl: '/upload/accessories.png',
  },
] as const;

export type WardrobeCategoryId = (typeof WARDROBE_CATEGORIES)[number]['id'];

export const WARDROBE_CATEGORY_FRAMING: Record<
  WardrobeCategoryId,
  { scale: number; translateY: number }
> = {
  top: { scale: 1.5, translateY: 22 },
  bottom: { scale: 2, translateY: 22 },
  outerwear: { scale: 2, translateY: 24 },
  shoes: { scale: 2, translateY: 25 },
  accessory: { scale: 1.6, translateY: 22 },
};
