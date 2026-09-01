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

export function reviewProgressLabel(current: number, total: number): string {
  if (total <= 1) return "";
  return `Item ${current} of ${total}`;
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

export function navigateAfterDraftSaved(
  remainingQueue: string[],
  total: number,
) {
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
): `/wardrobe/edit/${string}` {
  if (queue.length === 0 && total <= 1) {
    return `/wardrobe/edit/${id}`;
  }

  const params = new URLSearchParams({
    queue: queue.join(","),
    total: String(total),
  });
  return `/wardrobe/edit/${id}?${params.toString()}`;
}
