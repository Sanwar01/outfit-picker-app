import { useQuery } from "@tanstack/react-query";
import { fetchUsageSnapshot } from "@/services/billing";
import { queryKeys } from "@/services/query-client";

const USAGE_STALE_MS = 60 * 1000;

export function useUsageSnapshotQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billing.usage(),
    queryFn: async () => {
      const result = await fetchUsageSnapshot();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    enabled,
    staleTime: USAGE_STALE_MS,
  });
}
