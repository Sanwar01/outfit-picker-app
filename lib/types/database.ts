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
          created_at?: string;
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
