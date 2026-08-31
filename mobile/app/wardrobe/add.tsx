import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { apiPost } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function AddClothingScreen() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function pickAndUpload(useCamera: boolean) {
    if (!user) return;

    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera or photos to add items.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 0.8,
        });

    if (result.canceled) return;

    setUploading(true);
    let uploaded = 0;
    let lastError = "Couldn't upload that photo.";

    for (const asset of result.assets) {
      const itemId =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const path = `${user.id}/${itemId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("wardrobe-images")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });

      if (uploadError) {
        lastError = uploadError.message;
        continue;
      }

      const { error: insertError } = await supabase.from("clothing_items").insert({
        id: itemId,
        user_id: user.id,
        image_url: path,
        name: "Clothing item",
        category: "top",
      });

      if (insertError) {
        lastError = insertError.message;
        continue;
      }

      await apiPost("/api/clothing/tag", { itemId });
      uploaded += 1;
    }

    setUploading(false);

    if (uploaded === 0) {
      Alert.alert("Couldn't add that", lastError);
      return;
    }

    router.back();
  }

  return (
    <Screen>
      <ScreenTitle>Add clothes</ScreenTitle>
      <ScreenSubtitle>
        Snap or upload photos — AI will tag each item for you.
      </ScreenSubtitle>

      <View style={styles.actions}>
        <Button
          title="Take photo"
          loading={uploading}
          onPress={() => void pickAndUpload(true)}
        />
        <Button
          title="Choose from gallery"
          variant="outline"
          loading={uploading}
          onPress={() => void pickAndUpload(false)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: 24, gap: 12 },
});
