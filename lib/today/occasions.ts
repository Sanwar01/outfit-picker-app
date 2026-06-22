export type OccasionId =
  | "casual"
  | "walk"
  | "work"
  | "date_night"
  | "gym"
  | "formal"
  | "auto";

export interface Occasion {
  id: OccasionId;
  label: string;
  description: string;
  formalityTarget: number;
  aiHint: string;
}

export const PICKABLE_OCCASIONS: Occasion[] = [
  {
    id: "casual",
    label: "Casual day",
    description: "Everyday errands and relaxing",
    formalityTarget: 2.5,
    aiHint: "Relaxed everyday outfit — easy and comfortable.",
  },
  {
    id: "walk",
    label: "Walk",
    description: "Comfortable layers for being outside",
    formalityTarget: 2,
    aiHint: "Comfortable walking outfit with practical shoes and weather-appropriate layers.",
  },
  {
    id: "work",
    label: "Work",
    description: "Smart and put-together",
    formalityTarget: 4,
    aiHint: "Professional, polished look suitable for office or meetings.",
  },
  {
    id: "date_night",
    label: "Date night",
    description: "Elevated but not overdressed",
    formalityTarget: 4,
    aiHint: "Intentional, dressier evening look — refined and confident.",
  },
  {
    id: "gym",
    label: "Gym ready",
    description: "Active and practical",
    formalityTarget: 1.5,
    aiHint: "Athletic or sporty pieces — breathable, practical, easy to move in.",
  },
  {
    id: "formal",
    label: "Wedding / formal",
    description: "Your most polished pieces",
    formalityTarget: 5,
    aiHint: "Formal occasion — most polished, dressy combination from the wardrobe.",
  },
];

export const CHOOSE_FOR_ME: Occasion = {
  id: "auto",
  label: "Choose for me today",
  description: "Based on weather and your style",
  formalityTarget: 3,
  aiHint: "",
};

export function getOccasion(id: OccasionId): Occasion {
  if (id === "auto") return CHOOSE_FOR_ME;
  return PICKABLE_OCCASIONS.find((o) => o.id === id) ?? CHOOSE_FOR_ME;
}

export function occasionLabel(id: OccasionId): string {
  return getOccasion(id).label;
}
