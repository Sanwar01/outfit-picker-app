import { router } from "expo-router";

export function parseReviewQueueParam(
  queue: string | string[] | undefined,
): string[] {
  if (!queue) return [];
  const raw = Array.isArray(queue) ? queue.join(",") : queue;
  return raw.split(",").filter(Boolean);
}

export function parseReviewTotal(
  total: string | string[] | undefined,
  queueLength: number,
): number {
  if (typeof total === "string" && total) {
    const parsed = Number.parseInt(total, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return queueLength + 1;
}

export function parseBulkParam(
  bulk: string | string[] | undefined,
): boolean {
  if (!bulk) return false;
  const value = Array.isArray(bulk) ? bulk[0] : bulk;
  return value === "1" || value === "true";
}

export function reviewProgressLabel(current: number, total: number): string {
  if (total <= 1) return "";
  return `Item ${current} of ${total}`;
}

export function navigateToBulkReview(ids?: string[]) {
  router.push({
    pathname: "/wardrobe/bulk-review",
    params: ids?.length ? { ids: ids.join(",") } : undefined,
  });
}

export function navigateAfterBulkItemReview() {
  router.replace("/wardrobe/bulk-review");
}

export function navigateToDraftReview(
  id: string,
  remainingQueue: string[],
  total: number,
) {
  if (remainingQueue.length === 0 && total <= 1) {
    router.push(`/wardrobe/review/${id}`);
    return;
  }

  router.push({
    pathname: "/wardrobe/review/[id]",
    params: {
      id,
      queue: remainingQueue.join(","),
      total: String(total),
    },
  });
}

export function navigateToDraftReviewFromBulk(id: string) {
  router.push({
    pathname: "/wardrobe/review/[id]",
    params: { id, bulk: "1" },
  });
}

export function navigateAfterDraftSaved(
  remainingQueue: string[],
  total: number,
  fromBulk = false,
) {
  if (fromBulk) {
    navigateAfterBulkItemReview();
    return;
  }

  if (remainingQueue.length === 0) {
    router.replace("/(tabs)/wardrobe");
    return;
  }

  const [next, ...rest] = remainingQueue;
  router.replace({
    pathname: "/wardrobe/review/[id]",
    params: {
      id: next,
      queue: rest.join(","),
      total: String(total),
    },
  });
}

export function editDraftRoute(
  id: string,
  queue: string[],
  total: number,
  fromBulk = false,
): `/wardrobe/edit/${string}` {
  const params = new URLSearchParams();
  if (fromBulk) {
    params.set("bulk", "1");
  } else if (queue.length > 0 || total > 1) {
    params.set("queue", queue.join(","));
    params.set("total", String(total));
  }
  const query = params.toString();
  return query ? `/wardrobe/edit/${id}?${query}` : `/wardrobe/edit/${id}`;
}
