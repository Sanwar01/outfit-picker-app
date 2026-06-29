"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface ProfileMenuRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

export function ProfileMenuRow({
  icon: Icon,
  title,
  description,
  href,
}: ProfileMenuRowProps) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 transition-colors hover:bg-background"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toast.message("Coming soon")}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 text-left transition-colors hover:bg-background"
    >
      {content}
    </button>
  );
}
