import { z, toJSONSchema } from "zod";
import {
  getGeminiClient,
  getTagModel,
  isGeminiRulesOnly,
  withGeminiRetry,
} from "@/lib/ai/gemini";
import type { ClothingCategory } from "@/lib/types/database";
import { FIT_OPTIONS } from "@/lib/wardrobe/clothing-fit";

const OCCASION_IDS = [
  "casual",
  "walk",
  "work",
  "date_night",
  "gym",
  "formal",
  "travel",
] as const;

const ClothingTagSchema = z.object({
  name: z.string(),
  category: z.enum(["top", "bottom", "outerwear", "shoes", "accessory"]),
  sub_category: z.string(),
  colors: z.array(z.string()).min(1),
  pattern: z.string(),
  season: z.array(z.string()),
  formality: z.number().int().min(1).max(5),
  style_tags: z.array(z.string()),
  occasions: z.array(z.enum(OCCASION_IDS)),
  material: z.string().nullable(),
  brand: z.string().nullable(),
  fit: z.enum(FIT_OPTIONS.map((option) => option.id) as [string, ...string[]]).nullable(),
  warmth: z.number().int().min(1).max(5).nullable(),
  confidence: z.number().min(0).max(1),
});

export type ClothingTagResult = z.infer<typeof ClothingTagSchema>;

const SYSTEM_PROMPT = `You are a wardrobe cataloging assistant. Analyze the clothing item in the image.
Return structured data for the primary visible item only.

Categories: top, bottom, outerwear, shoes, accessory.
sub_category should be a specific garment type (e.g. Overshirt, Chinos, Sneakers, Watch, Necklace, Hat, Scarf, Tote bag).
colors: primary colour first, optional secondary colour second.
style_tags: 2-4 short style descriptors (e.g. minimal, smart casual, layering piece, neutral).
occasions: pick from casual, walk, work, date_night, gym, formal, travel — only where appropriate.
material: infer only when reasonably visible; otherwise null.
brand: only when a logo or label is clearly visible; otherwise null.
fit: infer regular, slim, relaxed, or oversized when visible; otherwise null.
warmth: 1 (very light) to 5 (very warm) for layering suitability.
Lower confidence if uncertain. Do not invent items not visible in the image.`;

async function fetchImageAsBase64(
  imageUrl: string,
): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const mimeType = response.headers.get("content-type") ?? "image/webp";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { data: buffer.toString("base64"), mimeType };
}

async function callTagGemini(imageUrl: string): Promise<ClothingTagResult> {
  const { data, mimeType } = await fetchImageAsBase64(imageUrl);
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: getTagModel(),
    contents: [
      {
        inlineData: {
          mimeType,
          data,
        },
      },
      { text: "Tag this clothing item for a digital wardrobe catalog." },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: toJSONSchema(ClothingTagSchema),
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = ClothingTagSchema.parse(JSON.parse(text));

  return {
    ...parsed,
    category: parsed.category as ClothingCategory,
  };
}

export async function tagClothingFromImage(
  imageUrl: string,
): Promise<ClothingTagResult> {
  if (isGeminiRulesOnly()) {
    throw new Error("AI tagging is disabled (GEMINI_RULES_ONLY)");
  }
  return withGeminiRetry(() => callTagGemini(imageUrl));
}
