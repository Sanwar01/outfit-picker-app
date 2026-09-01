import { Tabs, router } from "expo-router";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/lib/theme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  const items = [
    { key: "today", label: "Today", icon: "sunny-outline" as const, active: "sunny" as const },
    { key: "wardrobe", label: "Wardrobe", icon: "shirt-outline" as const, active: "shirt" as const },
    { key: "add", label: "Add", fab: true },
    { key: "outfits", label: "Outfits", icon: "bookmark-outline" as const, active: "bookmark" as const },
    { key: "profile", label: "Profile", icon: "person-outline" as const, active: "person" as const },
  ];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {items.map((item) => {
          if (item.fab) {
            return (
              <Pressable
                key={item.key}
                onPress={() => router.push("/wardrobe/add")}
                style={styles.fab}
              >
                <Ionicons name="add" size={24} color={colors.primaryForeground} />
              </Pressable>
            );
          }

          const routeIndex = state.routes.findIndex(
            (r: { name: string }) => r.name === item.key,
          );
          const isFocused = state.index === routeIndex;

          return (
            <Pressable
              key={item.key}
              onPress={() => {
                const route = state.routes[routeIndex];
                if (!route) return;
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tab}
            >
              <View style={styles.iconPill}>
                <Ionicons
                  name={isFocused ? item.active! : item.icon!}
                  size={20}
                  color={isFocused ? colors.ink : colors.inkFaint}
                />
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="today" />
      <Tabs.Screen name="wardrobe" />
      <Tabs.Screen name="outfits" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screen,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: spacing.tabBarHeight,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: "center",
    minWidth: 56,
    gap: 2,
  },
  iconPill: {
    width: 56,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    color: colors.inkFaint,
    fontFamily: "DMSans_500Medium",
  },
  labelActive: {
    color: colors.ink,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
