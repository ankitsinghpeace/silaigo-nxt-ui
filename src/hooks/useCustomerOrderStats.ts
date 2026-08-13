import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "@/services/modules/orders.api";

export interface CustomerOrderStat {
  count: number;
  lastOrderDate?: string;
}

/**
 * Client-side aggregation of order counts per customer.
 *
 * NOTE: this is a stop-gap — the backend `/auth/customers` list does not
 * return `orderCount` / `lastOrderDate`, so we page through `/orders/all`
 * (capped) and group by customerId. See BACKEND_CHANGES_NEEDED.md — this
 * should move server-side once the backend exposes those fields directly.
 */
export function useCustomerOrderStats() {
  return useQuery({
    queryKey: ["customer-order-stats"],
    queryFn: async () => {
      const map: Record<string, CustomerOrderStat> = {};
      let page = 1;
      let hasNext = true;
      const MAX_PAGES = 8; // safety cap (~800 orders)

      while (hasNext && page <= MAX_PAGES) {
        const res = await getAllOrders(
          new URLSearchParams({
            page: String(page),
            limit: "100",
            sortBy: "newest",
          }).toString(),
        );

        (res?.orders || []).forEach((o: any) => {
          const key = o.customerId || o.customerPhone || o.customerName;
          if (!key) return;
          if (!map[key]) map[key] = { count: 0 };
          map[key].count += 1;
          if (
            o.orderDate &&
            (!map[key].lastOrderDate ||
              new Date(o.orderDate) > new Date(map[key].lastOrderDate))
          ) {
            map[key].lastOrderDate = o.orderDate;
          }
        });

        hasNext = !!res?.pagination?.hasNextPage;
        page = res?.pagination?.nextPage || page + 1;
      }

      return map;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    retry: 0,
  });
}
