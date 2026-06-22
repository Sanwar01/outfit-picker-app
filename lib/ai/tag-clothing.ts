import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";
import { z } from "zod";
import type { ClothingCategory } from "@/lib/types/database";

const ClothingTagSchema = z.object({
  name: z.string(),
  category: z.enum(["top", "bottom", "outerwear", "shoes", "accessory"]),
  colors: z.array(z.string()),
  pattern: z.string(),
  season: z.array(z.string()),
  formality: z.number().int().min(1).max(5),
  confidence: z.number().min(0).max(1),
});

export type ClothingTagResult = z.infer<typeof ClothingTagSchema>;

const SYSTEM_PROMPT = `You are a wardrobe cataloging assistant. Analyze the clothing item in the image.
Return structured data for the primary visible item only.
Categories: top, bottom, outerwear, shoes, accessory.
Lower confidence if uncertain. Do not invent items not visible in the image.`;

const RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    category: {
      type: SchemaType.STRING,
      format: "enum" as const,
      enum: ["top", "bottom", "outerwear", "shoes", "accessory"],
    },
    colors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    pattern: { type: SchemaType.STRING },
    season: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    formality: { type: SchemaType.INTEGER },
    confidence: { type: SchemaType.NUMBER },
  },
  required: [
    "name",
    "category",
    "colors",
    "pattern",
    "season",
    "formality",
    "confidence",
  ],
};

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const mimeType = response.headers.get("content-type") ?? "image/webp";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { data: buffer.toString("base64"), mimeType };
}

export async function tagClothingFromImage(
  imageUrl: string
): Promise<ClothingTagResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { data, mimeType } = await fetchImageAsBase64(imageUrl);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data,
      },
    },
    { text: "Tag this clothing item for a digital wardrobe catalog." },
  ]);

  const text = result.response.text();
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = ClothingTagSchema.parse(JSON.parse(text));

  return {
    ...parsed,
    category: parsed.category as ClothingCategory,
  };
}
