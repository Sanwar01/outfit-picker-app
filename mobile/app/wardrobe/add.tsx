import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { ScreenSubtitle, ScreenTitle } from '@/components/ui/primitives';
import { Button } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';
import { formatUsageFraction } from '@/lib/billing';
import { createClothingDraft } from '@/lib/wardrobe-drafts';
import { createItemId } from '@/lib/create-item-id';
import { invalidateBillingUsage } from '@/lib/queries/invalidate';
import { useUsageSnapshotQuery } from '@/lib/queries/billing';
import { navigateToBulkReview, navigateToDraftReview } from '@/lib/review-queue';
import { supabase } from '@/lib/supabase';
import { colors, fonts } from '@/lib/theme';

export default function AddClothingScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: usage } = useUsageSnapshotQuery(Boolean(user?.id));
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function uploadOneAsset(
    userId: string,
    asset: ImagePicker.ImagePickerAsset,
  ): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
    const itemId = createItemId();
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const path = `${userId}/${itemId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('wardrobe-images')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const draftResult = await createClothingDraft({ itemId, imagePath: path });
    if (!draftResult.ok) {
      await supabase.storage.from('wardrobe-images').remove([path]);
      return { ok: false, error: draftResult.error };
    }

    return { ok: true, id: draftResult.data.id };
  }

  async function pickAndUpload(useCamera: boolean) {
    if (!user) return;

    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera or photos to add items.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          quality: 0.8,
        });

    if (result.canceled || result.assets.length === 0) return;

    setUploading(true);
    setProgress(null);

    const uploadedIds: string[] = [];
    let lastError = "Couldn't upload that photo.";

    try {
      for (let index = 0; index < result.assets.length; index += 1) {
        if (result.assets.length > 1) {
          setProgress(`Analysing ${index + 1} of ${result.assets.length}…`);
        }

        const uploadResult = await uploadOneAsset(
          user.id,
          result.assets[index],
        );
        if (uploadResult.ok) {
          uploadedIds.push(uploadResult.id);
        } else {
          lastError = uploadResult.error;
        }
      }

      if (uploadedIds.length === 0) {
        Alert.alert("Couldn't add those photos", lastError);
        return;
      }

      invalidateBillingUsage(queryClient);

      if (uploadedIds.length < result.assets.length) {
        Alert.alert(
          "Some photos couldn't be added",
          `${uploadedIds.length} of ${result.assets.length} are ready to review.`,
        );
      }

      if (uploadedIds.length === 1) {
        navigateToDraftReview(uploadedIds[0], [], 1);
      } else {
        navigateToBulkReview(uploadedIds);
      }
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  return (
    <Screen>
      <ScreenTitle>Add clothes</ScreenTitle>
      <ScreenSubtitle>
        Take a photo or pick several from your gallery. AI tags each one — you
        confirm before it joins your wardrobe.
      </ScreenSubtitle>

      {usage?.aiTags.limit != null ? (
        <Pressable
          onPress={() => router.push('/profile/upgrade')}
          disabled={usage.plan !== 'free'}
        >
          <Text style={styles.quotaHint}>
            AI tagging {formatUsageFraction(usage.aiTags)} this month
            {usage.plan === 'free' ? ' · Upgrade for more' : ''}
          </Text>
        </Pressable>
      ) : null}

      {progress ? <Text style={styles.progress}>{progress}</Text> : null}

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
  quotaHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  progress: {
    marginTop: 16,
    fontSize: 14,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
