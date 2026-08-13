import { useQuery } from "@tanstack/react-query";
import { getOrderByIdApi } from "@/services/modules/orders.api";

export interface UserWorkloadStat {
  user: string;
  actions: number;
  totalHours: number;
  avgHours: number;
  byStage: Record<string, { count: number; hours: number }>;
}

/**
 * Computes per-teammate time-in-stage from order `timeLine` entries
 * (each entry already records `updatedBy` + `timeStamp`). The duration
 * between two consecutive timeline entries is attributed to whoever made
 * the LATER entry (i.e. how long that stage sat before they moved it on).
 *
 * NOTE: `/orders/all` (list) doesn't return `timeLine` — only
 * `/orders/:id` (detail) does — so this fetches detail for a capped sample
 * of orders (most recent N) rather than the whole dataset, to keep this
 * practical without a dedicated backend aggregation endpoint. See
 * BACKEND_CHANGES_NEEDED.md for the real fix (a proper activity-log
 * endpoint would remove the need for N detail calls entirely).
 */
export function useTeamWorkloadStats(orderIds: string[]) {
  return useQuery({
    queryKey: ["team-workload", orderIds.slice().sort().join(",")],
    queryFn: async () => {
      const details = await Promise.all(
        orderIds.map((id) => getOrderByIdApi(id).catch(() => null)),
      );

      const perUser: Record<string, UserWorkloadStat> = {};

      details.forEach((detail: any) => {
        const timeline = detail?.order?.timeLine || [];
        const sorted = [...timeline].sort(
          (a: any, b: any) =>
            new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime(),
        );

        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1];
          const curr = sorted[i];
          const hours =
            (new Date(curr.timeStamp).getTime() -
              new Date(prev.timeStamp).getTime()) /
            (1000 * 60 * 60);
          if (!isFinite(hours) || hours < 0) continue;

          const user = curr.updatedBy || "Unknown";
          const stage = curr.status || "Unknown";

          if (!perUser[user]) {
            perUser[user] = { user, actions: 0, totalHours: 0, avgHours: 0, byStage: {} };
          }
          perUser[user].actions += 1;
          perUser[user].totalHours += hours;
          if (!perUser[user].byStage[stage]) {
            perUser[user].byStage[stage] = { count: 0, hours: 0 };
          }
          perUser[user].byStage[stage].count += 1;
          perUser[user].byStage[stage].hours += hours;
        }
      });

      Object.values(perUser).forEach((u) => {
        u.avgHours = u.actions ? u.totalHours / u.actions : 0;
      });

      return Object.values(perUser).sort((a, b) => b.actions - a.actions);
    },
    enabled: orderIds.length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    retry: 0,
  });
}
