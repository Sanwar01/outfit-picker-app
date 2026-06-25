"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Shirt, Plus, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/wardrobe/add", label: "Add", icon: Plus, fab: true },
  { href: "/outfits", label: "Outfits", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/wardrobe/add") return pathname === "/wardrobe/add";
  return pathname === href;
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="pointer-events-auto flex h-16 w-full max-w-md items-center justify-around rounded-full border border-neutral-200 bg-white/95 px-3 shadow-lg backdrop-blur-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          const Icon = item.icon;

          if ("fab" in item && item.fab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-12 w-12 -translate-y-4 items-center justify-center rounded-full bg-neutral-950 text-white shadow-lg"
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
                "flex min-w-0 flex-col items-center gap-0.5 text-[10px] font-medium",
                isActive ? "text-neutral-950" : "text-neutral-400",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-14 items-center justify-center rounded-2xl transition-colors",
                  isActive && "bg-neutral-950 text-white",
                )}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2 : 1.75}
                />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
