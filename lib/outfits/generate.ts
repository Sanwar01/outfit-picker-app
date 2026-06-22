import type { ClothingItem, Profile } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { fetchWeather } from "@/lib/weather/open-meteo";
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
import { getSignedImageUrls } from "@/lib/storage";
import { CATEGORY_LABELS } from "@/lib/types/clothing";
import type { ClothingCategory } from "@/lib/types/database";

export interface GeneratedOutfitResponse {
  item_ids: string[];
  rationale: string;
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
  excludeCombinations: string[][]
): string | null {
  if (excludeCombinations.length > 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  return `${userId}:${today}:${weather.temp_c}:${weather.condition}:${weather.precip_chance}`;
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
  if (profile.location_lat != null && profile.location_lng != null) {
    return fetchWeather(
      profile.location_lat,
      profile.location_lng,
      profile.location_city
    );
  }

  return {
    temp_c: 18,
    condition: "cloudy",
    precip_chance: 20,
    city: profile.location_city,
  };
}

async function buildResponse(
  aiResult: { item_ids: string[]; rationale: string; slots: Record<string, string> },
  filtered: ClothingItem[],
  weather: WeatherSnapshot,
  generated_by: "ai" | "rules"
): Promise<GeneratedOutfitResponse> {
  const selectedItems = filtered.filter((i) =>
    aiResult.item_ids.includes(i.id)
  );
  const imageUrls = await getSignedImageUrls(
    selectedItems.map((i) => i.image_url)
  );

  return {
    item_ids: aiResult.item_ids,
    rationale: aiResult.rationale,
    slots: aiResult.slots,
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
  userId?: string
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
    ? buildCacheKey(userId, weather, excludeCombinations)
    : null;
  const cached = getCachedOutfit(cacheKey);
  if (cached) return cached;

  const filtered = filterWardrobeForWeather(activeItems, weather);

  if (!wardrobeHasMinimumItems(filtered)) {
    throw new Error(
      "Nothing in your closet fits today's weather. A different layer or pair of shoes might do the trick."
    );
  }

  const wardrobeForAI = toWardrobeForAI(filtered);

  let generated_by: "ai" | "rules" = "ai";
  let aiResult;

  try {
    aiResult = await generateOutfitWithAI({
      weather,
      styleVibes: profile.style_vibes ?? [],
      wardrobe: wardrobeForAI,
      excludeCombinations,
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
    });
  }

  if (!validateOutfitSelection(aiResult.item_ids, filtered)) {
    generated_by = "rules";
    aiResult = generateOutfitLocally({
      wardrobe: filtered,
      weather,
      excludeCombinations,
      styleVibes: profile.style_vibes ?? [],
    });
  }

  const slots = Object.fromEntries(
    Object.entries(aiResult.slots).filter(([, id]) => !!id)
  ) as Record<string, string>;

  const response = await buildResponse(
    {
      item_ids: aiResult.item_ids,
      rationale: aiResult.rationale,
      slots,
    },
    filtered,
    weather,
    generated_by
  );

  setCachedOutfit(cacheKey, response);
  return response;
}
