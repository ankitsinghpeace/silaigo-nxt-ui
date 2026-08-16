"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowRight, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllOrders, updateOrdersProcessingState } from "@/services/modules/orders.api";
import {
  ROLE_QUEUE_STAGE,
  ROLE_COMPLETION_STAGE,
  ROLE_QUEUE_TITLE,
  STAGE_LABELS,
  getDeliveryUrgency,
  URGENCY_STYLES,
} from "@/lib/orderStageConfig";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface RoleQueueViewProps {
  role: "CUTTING" | "STITCHING";
  onOpenOrder: (orderId: string) => void;
  canEdit: boolean;
}

const RoleQueueView: React.FC<RoleQueueViewProps> = ({ role, onOpenOrder, canEdit }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queueStage = ROLE_QUEUE_STAGE[role];
  const completionStage = ROLE_COMPLETION_STAGE[role];
  const actionVerb = role === "STITCHING" ? "Stitching" : "Cutting";

  // Local-only "Started" affordance (section 5-7): the backend doesn't yet
  // persist an intermediate CUTTING_STARTED/STITCHING_STARTED state (see
  // be_changes2.md), so we track it client-side to give the two-step
  // Start/End UX without inventing a fake backend write.
  const storageKey = `silai_${role.toLowerCase()}_started`;
  const [startedIds, setStartedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setStartedIds(new Set(JSON.parse(raw)));
    } catch {
      // ignore malformed local state
    }
  }, [storageKey]);

  const markStarted = (orderId: string) => {
    setStartedIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const { data, isPending, refetch } = useQuery({
    queryKey: ["role-queue", role],
    queryFn: () =>
      getAllOrders(
        new URLSearchParams({
          page: "1",
          limit: "100",
          sortBy: "newest",
          sortByDeliveryDate: "1",
        }).toString(),
      ),
    staleTime: 1000 * 30,
  });

  const queueOrders = useMemo(() => {
    const orders = data?.orders || [];
    return orders
      .filter((o: any) => o.orderProcessingState === queueStage)
      .sort((a: any, b: any) => {
        const da = a.appointmentDate ? new Date(a.appointmentDate).getTime() : Infinity;
        const db = b.appointmentDate ? new Date(b.appointmentDate).getTime() : Infinity;
        return da - db;
      });
  }, [data, queueStage]);

  const { mutate: advanceStage, isPending: isAdvancing, variables } = useMutation({
    mutationFn: (orderId: string) =>
      updateOrdersProcessingState(orderId, { nextState: completionStage }),
    onSuccess: (_res, orderId) => {
      toast({ title: "Moved to next stage", description: STAGE_LABELS[completionStage] });
      setStartedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        }
        return next;
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast({ title: "Couldn't update order", description: generateErrorMessage(error), variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4" data-testid={`role-queue-${role.toLowerCase()}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{ROLE_QUEUE_TITLE[role]}</h2>
          <p className="text-sm text-muted-foreground">
            Orders waiting on your team, sorted by nearest delivery date.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh {isPending && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
        </Button>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading queue...</p>
      ) : queueOrders.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Nothing in your queue right now. 🎉
        </div>
      ) : (
        <div className="rounded-lg border divide-y overflow-hidden">
          {queueOrders.map((order: any) => {
            const urgency = getDeliveryUrgency(order.appointmentDate);
            return (
              <div
                key={order.id}
                className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm hover:bg-muted/40"
                data-testid={`queue-order-row-${order.id}`}
              >
                <div className="col-span-12 sm:col-span-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onOpenOrder(order.id)}
                    className="font-mono text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    {order.orderId}
                  </button>
                  <div className="font-medium truncate">{order.customerName}</div>
                </div>
                <div className="col-span-6 sm:col-span-3 text-xs text-muted-foreground">
                  {order.appointmentDate && !isNaN(new Date(order.appointmentDate).getTime())
                    ? format(new Date(order.appointmentDate), "dd MMM yyyy")
                    : "No date"}
                  {order.appointmentTime ? ` · ${order.appointmentTime}` : ""}
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      URGENCY_STYLES[urgency.level],
                    )}
                  >
                    <Clock className="w-3 h-3" /> {urgency.label}
                  </span>
                </div>
                <div className="col-span-12 sm:col-span-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onOpenOrder(order.id)}>
                    View
                  </Button>
                  {!startedIds.has(order.id) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canEdit}
                      onClick={() => markStarted(order.id)}
                      data-testid={`queue-start-btn-${order.id}`}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Start {actionVerb}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!canEdit || isAdvancing}
                      onClick={() => advanceStage(order.id)}
                      data-testid={`queue-advance-btn-${order.id}`}
                    >
                      {isAdvancing && variables === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 mr-1" />
                      )}
                      End {actionVerb}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoleQueueView;
