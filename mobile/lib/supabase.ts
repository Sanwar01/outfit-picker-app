import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** AsyncStorage touches `window` on web — use a noop adapter during SSR. */
const isClient = typeof window !== "undefined";

const ssrSafeStorage = isClient
  ? AsyncStorage
  : {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: isClient,
    persistSession: isClient,
    detectSessionInUrl: false,
  },
});

/** Shared storage adapter for app-level persistence (welcome flag, remembered email, etc.) */
export const appStorage = ssrSafeStorage;
