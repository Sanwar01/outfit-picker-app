"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/wardrobe/add", label: "Add", icon: Plus, fab: true },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/wardrobe/add"
              ? pathname === "/wardrobe/add"
              : item.href === "/wardrobe"
                ? pathname === "/wardrobe"
                : pathname === item.href;
          const Icon = item.icon;

          if ("fab" in item && item.fab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-12 w-12 -translate-y-2 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg"
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-xs",
                isActive ? "text-stone-900" : "text-stone-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
