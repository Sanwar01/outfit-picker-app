import { Bell, SlidersHorizontal } from "lucide-react";

export function WardrobeHeader() {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          My Wardrobe
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Everything you own, perfectly organised
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700"
          aria-label="Notifications"
          disabled
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-neutral-950" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700"
          aria-label="Filters"
          disabled
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
