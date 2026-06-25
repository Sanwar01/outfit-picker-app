import type { ClothingItem, Profile } from "@/lib/types/database";
import { fetchWeatherDetail, defaultWeatherBundle } from "@/lib/weather/open-meteo";
import type { WeatherBundle, WeatherSnapshot } from "@/lib/weather/open-meteo";
import {
  filterWardrobeForWeather,
  generateOutfitLocally,
  getMissingSlots,
  repairOutfitSelection,
  toWardrobeForAI,
  validateOutfitSelection,
  wardrobeHasMinimumItems,
} from "@/lib/ai/outfit-rules";
import { generateOutfitWithAI } from "@/lib/ai/generate-outfit";
import { isGeminiRulesOnly } from "@/lib/ai/gemini";
import { getSignedImageUrls } from "@/lib/storage";
import { CATEGORY_LABELS } from "@/lib/types/clothing";
import type { ClothingCategory } from "@/lib/types/database";
import { getOccasion } from "@/lib/today/occasions";
import {
  buildOutfitDescription,
  buildShortRationale,
} from "@/lib/today/descriptions";
import type { OccasionId } from "@/lib/today/occasions";

export interface GeneratedOutfitResponse {
  item_ids: string[];
  rationale: string;
  description: string;
  occasion: OccasionId;
  slots: Record<string, string>;
  items: ClothingItem[];
  imageUrls: Record<string, string>;
  weather: WeatherSnapshot;
  generated_by: "ai" | "rules";
}

const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const outfitCache = new Map<
  string,
  { expiresAt: number; result: GeneratedOutfitResponse }
>();

function buildCacheKey(
  userId: string,
  weather: WeatherSnapshot,
  occasionId: OccasionId,
  excludeCombinations: string[][]
): string | null {
  if (excludeCombinations.length > 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  return `${userId}:${today}:${occasionId}:${weather.temp_c}:${weather.condition}:${weather.precip_chance}`;
}

function getCachedOutfit(
  key: string | null
): GeneratedOutfitResponse | null {
  if (!key) return null;
  const entry = outfitCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    outfitCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCachedOutfit(key: string | null, result: GeneratedOutfitResponse) {
  if (!key) return;
  outfitCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, result });
}

export async function resolveWeather(profile: Profile): Promise<WeatherSnapshot> {
  const bundle = await resolveWeatherBundle(profile);
  return bundle.current;
}

export async function resolveWeatherBundle(profile: Profile): Promise<WeatherBundle> {
  if (profile.location_lat != null && profile.location_lng != null) {
    return fetchWeatherDetail(
      profile.location_lat,
      profile.location_lng,
      profile.location_city
    );
  }

  return defaultWeatherBundle(profile.location_city);
}

async function buildResponse(
  aiResult: {
    item_ids: string[];
    rationale: string;
    description?: string;
    slots: Record<string, string>;
  },
  filtered: ClothingItem[],
  weather: WeatherSnapshot,
  occasionId: OccasionId,
  generated_by: "ai" | "rules"
): Promise<GeneratedOutfitResponse> {
  const selectedItems = filtered.filter((i) =>
    aiResult.item_ids.includes(i.id)
  );
  const imageUrls = await getSignedImageUrls(
    selectedItems.map((i) => i.image_url)
  );

  const slots = aiResult.slots;
  const description =
    aiResult.description?.trim() ||
    buildOutfitDescription(selectedItems, slots, occasionId, weather);
  const rationale =
    aiResult.rationale?.trim() || buildShortRationale(occasionId, weather);

  return {
    item_ids: aiResult.item_ids,
    rationale,
    description,
    occasion: occasionId,
    slots,
    items: selectedItems,
    imageUrls,
    weather,
    generated_by,
  };
}

export async function generateOutfitForUser(
  wardrobe: ClothingItem[],
  profile: Profile,
  excludeCombinations: string[][] = [],
  userId?: string,
  occasionId: OccasionId = "auto"
): Promise<GeneratedOutfitResponse> {
  const activeItems = wardrobe.filter((i) => i.status === "active");

  if (!wardrobeHasMinimumItems(activeItems)) {
    const missing = getMissingSlots(activeItems);
    const labels = missing.map(
      (slot) => CATEGORY_LABELS[slot as ClothingCategory].toLowerCase()
    );
    const need =
      labels.length === 1
        ? `a ${labels[0]}`
        : `${labels.slice(0, -1).join(", ")} and a ${labels[labels.length - 1]}`;
    throw new Error(
      `Add ${need} to your wardrobe — I'll take care of the outfit from there.`
    );
  }

  const weather = await resolveWeather(profile);
  const cacheKey = userId
    ? buildCacheKey(userId, weather, occasionId, excludeCombinations)
    : null;
  const cached = getCachedOutfit(cacheKey);
  if (cached) return cached;

  const filtered = filterWardrobeForWeather(activeItems, weather);

  if (!wardrobeHasMinimumItems(filtered)) {
    throw new Error(
      "Nothing in your closet fits today's weather. A different layer or pair of shoes might do the trick."
    );
  }

  const occasion = getOccasion(occasionId);

  const rulesOnly =
    isGeminiRulesOnly() || excludeCombinations.length > 0;

  let generated_by: "ai" | "rules" = rulesOnly ? "rules" : "ai";
  let aiResult;

  if (rulesOnly) {
    aiResult = generateOutfitLocally({
      wardrobe: filtered,
      weather,
      excludeCombinations,
      styleVibes: profile.style_vibes ?? [],
      occasionId,
    });
  } else {
    const wardrobeForAI = toWardrobeForAI(filtered);
    try {
      aiResult = await generateOutfitWithAI({
        weather,
        styleVibes: profile.style_vibes ?? [],
        wardrobe: wardrobeForAI,
        excludeCombinations,
        occasionId,
        occasionHint: occasion.aiHint,
      });
      aiResult = repairOutfitSelection(aiResult, filtered, weather);
    } catch (error) {
      console.warn("AI outfit generation failed, using rules fallback:", error);
      generated_by = "rules";
      aiResult = generateOutfitLocally({
        wardrobe: filtered,
        weather,
        excludeCombinations,
        styleVibes: profile.style_vibes ?? [],
        occasionId,
      });
    }
  }

  if (!validateOutfitSelection(aiResult.item_ids, filtered)) {
    generated_by = "rules";
    aiResult = generateOutfitLocally({
      wardrobe: filtered,
      weather,
      excludeCombinations,
      styleVibes: profile.style_vibes ?? [],
      occasionId,
    });
  }

  const slots = Object.fromEntries(
    Object.entries(aiResult.slots).filter(([, id]) => !!id)
  ) as Record<string, string>;

  const response = await buildResponse(
    {
      item_ids: aiResult.item_ids,
      rationale: aiResult.rationale,
      description: aiResult.description,
      slots,
    },
    filtered,
    weather,
    occasionId,
    generated_by
  );

  setCachedOutfit(cacheKey, response);
  return response;
}
