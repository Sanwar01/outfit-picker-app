import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, ScreenSubtitle, ScreenTitle, Button } from '@/components/atoms';
import { MenuRow } from '@/components/molecules';
import { CompleteProfileBanner } from '../../sections/complete-profile-banner';
import { ProfileStatsCard } from '../../sections/profile-stats-card';
import { ProfileUsageCard } from '../../sections/profile-usage-card';
import { useAuth } from '@/lib/auth-context';
import {
  formatStyleVibesLabel,
  getProfileCompletionIssues,
  getProfileFirstName,
  getProfileInitials,
  getTimeGreeting,
} from '@/lib/profile-display';
import {
  invalidateOutfitsQueries,
  invalidateWardrobeQueries,
} from '@/lib/queries/invalidate';
import { useSavedOutfitsQuery } from '@/lib/queries/outfits';
import { useWardrobeScreenQuery } from '@/lib/queries/wardrobe';
import { colors } from '@/lib/theme';
import { useUsageSnapshotQuery } from '@/lib/queries/billing';
import { styles } from "./profile-screen.styles";

export function ProfileScreen() {
  const { profile, user, loading, refreshProfile, signOut } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: wardrobe,
    isFetching: wardrobeFetching,
    refetch: refetchWardrobe,
  } = useWardrobeScreenQuery(user?.id);
  const {
    data: outfits = [],
    isFetching: outfitsFetching,
    refetch: refetchOutfits,
  } = useSavedOutfitsQuery();
  const {
    data: usage,
    isFetching: usageFetching,
    refetch: refetchUsage,
  } = useUsageSnapshotQuery(Boolean(user?.id));

  const displayName = profile?.display_name?.trim() || 'Your profile';
  const firstName = getProfileFirstName(
    profile?.display_name,
    user?.email ?? '',
  );
  const initials = getProfileInitials(profile?.display_name, user?.email ?? '');
  const vibes = profile?.style_vibes ?? [];
  const completionIssues = getProfileCompletionIssues(profile);

  const stats = useMemo(() => {
    const activeItems =
      wardrobe?.items.filter((item) => item.status === 'active') ?? [];
    return {
      wardrobeCount: activeItems.length,
      outfitCount: outfits.length,
      totalWears: activeItems.reduce((sum, item) => sum + item.wear_count, 0),
    };
  }, [wardrobe?.items, outfits.length]);

  const refreshing = wardrobeFetching || outfitsFetching || usageFetching;

  async function handleRefresh() {
    await Promise.all([
      refreshProfile(),
      refetchWardrobe(),
      refetchOutfits(),
      refetchUsage(),
    ]);
    invalidateWardrobeQueries(queryClient, user?.id);
    invalidateOutfitsQueries(queryClient);
  }

  function handleSignOut() {
    Alert.alert(
      'Sign out?',
      "You'll need to sign in again to access your wardrobe.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await signOut();
              router.replace('/(auth)/login');
            })();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={colors.brand}
          />
        }
      >
        <ScreenTitle>
          {getTimeGreeting()}, {firstName}
        </ScreenTitle>
        <ScreenSubtitle>Your account</ScreenSubtitle>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              {user?.email ? (
                <Text style={styles.meta} numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
              {profile?.location_city ? (
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={colors.inkMuted}
                  />
                  <Text style={styles.meta} numberOfLines={1}>
                    {profile.location_city}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.vibes} numberOfLines={2}>
                {formatStyleVibesLabel(vibes)}
              </Text>
              <Text style={styles.vibesHint}>
                {vibes.length > 0
                  ? 'Used to personalize your daily outfits'
                  : 'Style vibes help tailor recommendations'}
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.editBtn,
              pressed && styles.editBtnPressed,
            ]}
            onPress={() => router.push('/profile/edit')}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Text style={styles.editBtnText}>Edit profile</Text>
          </Pressable>
        </View>

        <CompleteProfileBanner issues={completionIssues} />

        <ProfileStatsCard
          wardrobeCount={stats.wardrobeCount}
          outfitCount={stats.outfitCount}
          totalWears={stats.totalWears}
        />

        {usage ? <ProfileUsageCard usage={usage} /> : null}

        <View style={styles.menuCard}>
          <Text style={styles.menuTitle}>Settings</Text>
          <MenuRow
            icon="notifications-outline"
            title="Notifications"
            description="Outfit reminders and updates"
            comingSoon
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon="shield-outline"
            title="Privacy"
            description="How your data is used"
            comingSoon
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon="help-circle-outline"
            title="Help & feedback"
            description="Get support or send suggestions"
            comingSoon
          />
        </View>

        <Button title="Sign out" variant="outline" onPress={handleSignOut} />
      </ScrollView>
    </Screen>
  );
}
