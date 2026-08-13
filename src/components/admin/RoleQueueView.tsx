"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowRight, Clock } from "lucide-react";
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
    onSuccess: () => {
      toast({ title: "Moved to next stage", description: STAGE_LABELS[completionStage] });
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
                    Mark Done
                  </Button>
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
