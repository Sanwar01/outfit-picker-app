import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "wardrobe_has_seen_welcome";

export async function getHasSeenWelcome(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === "1";
}

export async function setHasSeenWelcome(): Promise<void> {
  await AsyncStorage.setItem(KEY, "1");
}
