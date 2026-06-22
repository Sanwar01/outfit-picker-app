import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";
import { z } from "zod";
import {
  compactWardrobeForAI,
  type WardrobeItemForAI,
  type OutfitGenerationResult,
} from "@/lib/ai/outfit-rules";
import type { OccasionId } from "@/lib/today/occasions";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { getOutfitModel, withGeminiRetry } from "@/lib/ai/gemini";

const OutfitSchema = z.object({
  item_ids: z.array(z.string()),
  rationale: z.string(),
  description: z.string().optional(),
  slots: z.object({
    top: z.string().optional(),
    bottom: z.string().optional(),
    outerwear: z.string().optional(),
    shoes: z.string().optional(),
    accessory: z.string().optional(),
  }),
});

const RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    item_ids: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    rationale: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    slots: {
      type: SchemaType.OBJECT,
      properties: {
        top: { type: SchemaType.STRING },
        bottom: { type: SchemaType.STRING },
        outerwear: { type: SchemaType.STRING },
        shoes: { type: SchemaType.STRING },
        accessory: { type: SchemaType.STRING },
      },
    },
  },
  required: ["item_ids", "rationale", "slots"],
};

const SYSTEM_PROMPT = `You are a personal stylist. Pick ONE complete outfit from the provided wardrobe items only.
Use item IDs exactly as given — never invent items.
Consider weather, formality balance, color harmony, and the occasion when provided.
Prefer variety: avoid recently repeated items when alternatives exist.
Must include top, bottom, and shoes. Add outerwear when weather is cool or rainy.
Return a short rationale (one sentence) and a description that names each selected piece by its exact wardrobe name.`;

async function callGemini(
  input: {
    weather: WeatherSnapshot;
    styleVibes: string[];
    wardrobe: WardrobeItemForAI[];
    excludeCombinations: string[][];
    occasionId: OccasionId;
    occasionHint: string;
  },
  apiKey: string
): Promise<OutfitGenerationResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: getOutfitModel(),
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const compactWardrobe = compactWardrobeForAI(input.wardrobe);

  const prompt = JSON.stringify({
    weather: input.weather,
    style_vibes: input.styleVibes,
    occasion: input.occasionId,
    occasion_guidance:
      input.occasionId === "auto"
        ? "Choose based on weather and style vibes."
        : input.occasionHint,
    wardrobe: compactWardrobe,
    exclude_combinations: input.excludeCombinations,
  });

  const result = await model.generateContent([
    { text: `Generate an outfit from this data:\n${prompt}` },
  ]);

  const text = result.response.text();
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = OutfitSchema.parse(JSON.parse(text));
  return {
    item_ids: parsed.item_ids,
    rationale: parsed.rationale,
    description: parsed.description ?? "",
    slots: parsed.slots,
  };
}

export async function generateOutfitWithAI(input: {
  weather: WeatherSnapshot;
  styleVibes: string[];
  wardrobe: WardrobeItemForAI[];
  excludeCombinations: string[][];
  occasionId: OccasionId;
  occasionHint: string;
}): Promise<OutfitGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return withGeminiRetry(() => callGemini(input, apiKey));
}
