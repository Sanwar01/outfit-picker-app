import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, ScreenSubtitle, ScreenTitle, Button } from '@/components/atoms';
import { CompleteProfileBanner } from '@/components/profile/complete-profile-banner';
import { ProfileMenuRow } from '@/components/profile/menu-row';
import { ProfileStatsCard } from '@/components/profile/profile-stats-card';
import { ProfileUsageCard } from '@/components/profile/profile-usage-card';
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
import { colors, fonts } from '@/lib/theme';
import { useUsageSnapshotQuery } from '@/lib/queries/billing';

export default function ProfileScreen() {
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
          <ProfileMenuRow
            icon="notifications-outline"
            title="Notifications"
            description="Outfit reminders and updates"
            comingSoon
          />
          <View style={styles.menuDivider} />
          <ProfileMenuRow
            icon="shield-outline"
            title="Privacy"
            description="How your data is used"
            comingSoon
          />
          <View style={styles.menuDivider} />
          <ProfileMenuRow
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

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.ink,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  vibes: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
    marginTop: 6,
  },
  vibesHint: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: colors.inkMuted,
    marginTop: 2,
  },
  editBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnPressed: {
    opacity: 0.9,
  },
  editBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
});
