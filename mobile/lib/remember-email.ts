import AsyncStorage from "@react-native-async-storage/async-storage";
import { REMEMBER_EMAIL_KEY } from "@shared/auth/constants";

export async function getRememberedEmail(): Promise<string> {
  return (await AsyncStorage.getItem(REMEMBER_EMAIL_KEY)) ?? "";
}

export async function writeRememberedEmail(email: string | null): Promise<void> {
  if (email) {
    await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email);
    return;
  }
  await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
}
