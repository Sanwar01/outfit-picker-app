export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClothingCategory =
  | "top"
  | "bottom"
  | "outerwear"
  | "shoes"
  | "accessory";

export type ClothingStatus = "active" | "archived";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          location_lat: number | null;
          location_lng: number | null;
          location_city: string | null;
          style_vibes: string[];
          style_goals: string[];
          onboarding_audience: string | null;
          onboarding_complete: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_city?: string | null;
          style_vibes?: string[];
          style_goals?: string[];
          onboarding_audience?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_city?: string | null;
          style_vibes?: string[];
          style_goals?: string[];
          onboarding_audience?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      clothing_items: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          name: string;
          category: ClothingCategory;
          colors: string[];
          season: string[];
          formality: number;
          pattern: string;
          status: ClothingStatus;
          ai_confidence: number | null;
          wear_count: number;
          last_worn_at: string | null;
          brand: string | null;
          material: string | null;
          warmth: number | null;
          notes: string | null;
          care_instructions: string | null;
          occasions: string[];
          style_tags: string[];
          is_favorite: boolean;
          purchase_price: number | null;
          description: string | null;
          sub_category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          name?: string;
          category: ClothingCategory;
          colors?: string[];
          season?: string[];
          formality?: number;
          pattern?: string;
          status?: ClothingStatus;
          ai_confidence?: number | null;
          wear_count?: number;
          last_worn_at?: string | null;
          brand?: string | null;
          material?: string | null;
          warmth?: number | null;
          notes?: string | null;
          care_instructions?: string | null;
          occasions?: string[];
          style_tags?: string[];
          is_favorite?: boolean;
          purchase_price?: number | null;
          description?: string | null;
          sub_category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          name?: string;
          category?: ClothingCategory;
          colors?: string[];
          season?: string[];
          formality?: number;
          pattern?: string;
          status?: ClothingStatus;
          ai_confidence?: number | null;
          wear_count?: number;
          last_worn_at?: string | null;
          brand?: string | null;
          material?: string | null;
          warmth?: number | null;
          notes?: string | null;
          care_instructions?: string | null;
          occasions?: string[];
          style_tags?: string[];
          is_favorite?: boolean;
          purchase_price?: number | null;
          description?: string | null;
          sub_category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      clothing_item_images: {
        Row: {
          id: string;
          clothing_item_id: string;
          image_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          clothing_item_id: string;
          image_url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          clothing_item_id?: string;
          image_url?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      outfits: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          is_favorite: boolean;
          weather_snapshot: Json | null;
          ai_rationale: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          is_favorite?: boolean;
          weather_snapshot?: Json | null;
          ai_rationale?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          is_favorite?: boolean;
          weather_snapshot?: Json | null;
          ai_rationale?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      outfit_items: {
        Row: {
          outfit_id: string;
          clothing_item_id: string;
          slot: ClothingCategory;
        };
        Insert: {
          outfit_id: string;
          clothing_item_id: string;
          slot: ClothingCategory;
        };
        Update: {
          outfit_id?: string;
          clothing_item_id?: string;
          slot?: ClothingCategory;
        };
        Relationships: [];
      };
      wear_log: {
        Row: {
          id: string;
          user_id: string;
          outfit_id: string | null;
          worn_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          outfit_id?: string | null;
          worn_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          outfit_id?: string | null;
          worn_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      clothing_category: ClothingCategory;
      clothing_status: ClothingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ClothingItem =
  Database["public"]["Tables"]["clothing_items"]["Row"];
export type ClothingItemImage =
  Database["public"]["Tables"]["clothing_item_images"]["Row"];
export type Outfit = Database["public"]["Tables"]["outfits"]["Row"];
export type OutfitItem = Database["public"]["Tables"]["outfit_items"]["Row"];
export type WearLog = Database["public"]["Tables"]["wear_log"]["Row"];
