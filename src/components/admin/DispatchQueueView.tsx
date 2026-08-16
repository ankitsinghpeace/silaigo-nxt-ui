"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Clock, CheckCircle2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAllOrders,
  updateOrdersProcessingState,
  notifyOrderApi,
  returnForAlterationApi,
  sendReviewLinkApi,
} from "@/services/modules/orders.api";
import { OrderProcessingState } from "@/types/enums";
import { getDeliveryUrgency, URGENCY_STYLES } from "@/lib/orderStageConfig";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import AlterationDialog from "./AlterationDialog";

interface DispatchQueueViewProps {
  onOpenOrder: (orderId: string) => void;
  canEdit: boolean;
  teamMembersViaRole: any[];
}

/**
 * Pickup Agent's "Ready to Dispatch" queue (section 9-13 of the workflow
 * redesign): every order here is at READY_FOR_DISPATCH and the Pickup Agent
 * decides between Delivered and Returned for Alteration.
 */
const DispatchQueueView: React.FC<DispatchQueueViewProps> = ({
  onOpenOrder,
  canEdit,
  teamMembersViaRole,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [alterationOrderId, setAlterationOrderId] = useState<string | null>(null);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["role-queue", "DISPATCH"],
    queryFn: () =>
      getAllOrders(
        new URLSearchParams({ page: "1", limit: "100", sortBy: "newest" }).toString(),
      ),
    staleTime: 1000 * 30,
  });

  const queueOrders = useMemo(() => {
    const orders = data?.orders || [];
    return orders
      .filter((o: any) => o.orderProcessingState === OrderProcessingState.READY_FOR_DISPATCH)
      .sort((a: any, b: any) => {
        const da = a.appointmentDate ? new Date(a.appointmentDate).getTime() : Infinity;
        const db = b.appointmentDate ? new Date(b.appointmentDate).getTime() : Infinity;
        return da - db;
      });
  }, [data]);

  const refreshAll = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const { mutate: markDelivered, isPending: isDelivering, variables: deliveringId } = useMutation({
    mutationFn: async (orderId: string) => {
      await updateOrdersProcessingState(orderId, {
        nextState: OrderProcessingState.ORDER_COMPLETE,
      });
      // Mandatory delivery + payment confirmation (existing MSG91 channel;
      // see be_changes2.md to extend this to WhatsApp).
      return notifyOrderApi(orderId, "delivered");
    },
    onSuccess: () => {
      toast({ title: "Order delivered", description: "Payment/delivery confirmation sent." });
      refreshAll();
    },
    onError: (error) => {
      toast({ title: "Couldn't mark delivered", description: generateErrorMessage(error), variant: "destructive" });
    },
  });

  const { mutate: submitAlteration, isPending: isSubmittingAlteration } = useMutation({
    mutationFn: ({ orderId, tailorId, urgency }: { orderId: string; tailorId: string; urgency: "1" | "2" | "3" }) =>
      returnForAlterationApi(orderId, { tailorId, urgency }),
    onSuccess: () => {
      toast({ title: "Returned for alteration", description: "Customer notified. Tailor assigned." });
      setAlterationOrderId(null);
      refreshAll();
    },
    onError: (error) => {
      toast({
        title: "Couldn't process alteration",
        description: `${generateErrorMessage(error)} (needs backend "/orders/:id/alteration" — see be_changes2.md)`,
        variant: "destructive",
      });
    },
  });

  const { mutate: sendReviewLink, isPending: isSendingReview, variables: reviewOrderId } = useMutation({
    mutationFn: (orderId: string) => sendReviewLinkApi(orderId),
    onSuccess: () => {
      toast({ title: "Review link sent" });
    },
    onError: (error) => {
      toast({
        title: "Couldn't send review link",
        description: `${generateErrorMessage(error)} (needs backend "/orders/:id/review-link" — see be_changes2.md)`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4" data-testid="dispatch-queue-view">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Ready to Dispatch</h2>
          <p className="text-sm text-muted-foreground">
            Orders ready for you to deliver, sorted by nearest delivery date.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh {isPending && <Loader2 className="ml-1 h-4 w-4 animate-spin" />}
        </Button>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading queue...</p>
      ) : queueOrders.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Nothing waiting for dispatch right now.
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-lg border">
          {queueOrders.map((order: any) => {
            const urgency = getDeliveryUrgency(order.appointmentDate);
            return (
              <div
                key={order.id}
                className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm hover:bg-muted/40"
                data-testid={`dispatch-order-row-${order.id}`}
              >
                <div className="col-span-12 min-w-0 sm:col-span-3">
                  <button
                    type="button"
                    onClick={() => onOpenOrder(order.id)}
                    className="font-mono text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    {order.orderId}
                  </button>
                  <div className="truncate font-medium">{order.customerName}</div>
                </div>
                <div className="col-span-6 text-xs text-muted-foreground sm:col-span-3">
                  {order.appointmentDate && !isNaN(new Date(order.appointmentDate).getTime())
                    ? format(new Date(order.appointmentDate), "dd MMM yyyy")
                    : "No date"}
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      URGENCY_STYLES[urgency.level],
                    )}
                  >
                    <Clock className="h-3 w-3" /> {urgency.label}
                  </span>
                </div>
                <div className="col-span-12 flex flex-wrap justify-end gap-2 sm:col-span-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canEdit || isSendingReview}
                    onClick={() => sendReviewLink(order.id)}
                    data-testid={`send-review-link-${order.id}`}
                    title="Optional — send only if this order was already delivered"
                  >
                    {isSendingReview && reviewOrderId === order.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-1 h-3.5 w-3.5" />
                    )}
                    Review Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canEdit}
                    onClick={() => setAlterationOrderId(order.id)}
                    data-testid={`return-for-alteration-${order.id}`}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" /> Returned for Alteration
                  </Button>
                  <Button
                    size="sm"
                    disabled={!canEdit || isDelivering}
                    onClick={() => markDelivered(order.id)}
                    data-testid={`mark-delivered-${order.id}`}
                  >
                    {isDelivering && deliveringId === order.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    )}
                    Delivered
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlterationDialog
        open={!!alterationOrderId}
        onOpenChange={(o) => !o && setAlterationOrderId(null)}
        teamMembersViaRole={teamMembersViaRole}
        isSubmitting={isSubmittingAlteration}
        onConfirm={({ tailorId, urgency }) =>
          alterationOrderId && submitAlteration({ orderId: alterationOrderId, tailorId, urgency })
        }
      />
    </div>
  );
};

export default DispatchQueueView;
