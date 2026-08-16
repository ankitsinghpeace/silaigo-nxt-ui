import { OrderProcessingState } from "@/types/enums";

/** Ordered pipeline stages — index = sequence in the fulfilment flow. */
export const PROCESSING_STAGE_SEQUENCE: OrderProcessingState[] = [
  OrderProcessingState.ORDER_INITIATED,
  OrderProcessingState.ORDER_PLACED,
  OrderProcessingState.MATERIAL_DELIVERED_TO_WORKSHOP,
  OrderProcessingState.ORDER_FULFILLED,
  OrderProcessingState.CUTTING_END,
  OrderProcessingState.STITCHING_END,
  OrderProcessingState.PRODUCT_VERIFIED_OR_RECTIFIED,
  OrderProcessingState.MATERIAL_PACKED,
  OrderProcessingState.READY_FOR_DISPATCH,
  OrderProcessingState.ORDER_COMPLETE,
];

export const STAGE_LABELS: Record<string, string> = {
  [OrderProcessingState.ORDER_INITIATED]: "Order Created",
  [OrderProcessingState.ORDER_PLACED]: "Order Placed",
  [OrderProcessingState.MATERIAL_DELIVERED_TO_WORKSHOP]: "Material at Workshop",
  [OrderProcessingState.ORDER_FULFILLED]: "Order Fulfilled · Cutting Queue",
  [OrderProcessingState.CUTTING_END]: "Cutting Ended",
  [OrderProcessingState.STITCHING_END]: "Stitching Ended",
  [OrderProcessingState.PRODUCT_VERIFIED_OR_RECTIFIED]: "Finishing & QC",
  [OrderProcessingState.MATERIAL_PACKED]: "Packed",
  [OrderProcessingState.READY_FOR_DISPATCH]: "Ready to Dispatch",
  [OrderProcessingState.ORDER_COMPLETE]: "Delivered",
};

/**
 * Simplified primary progression for the visual order stepper (section 27
 * of the workflow redesign) — groups the 10 fine-grained processing states
 * into 7 clean, non-overlapping steps. The full-detail dropdown (using
 * STAGE_LABELS/PROCESSING_STAGE_SEQUENCE above) remains available for
 * admins who need the fine-grained value.
 */
export const PRIMARY_STAGE_GROUPS: { key: string; label: string; states: OrderProcessingState[] }[] = [
  { key: "order_created", label: "Order Created", states: [OrderProcessingState.ORDER_INITIATED, OrderProcessingState.ORDER_PLACED] },
  { key: "order_fulfilled", label: "Order Fulfilled", states: [OrderProcessingState.MATERIAL_DELIVERED_TO_WORKSHOP] },
  { key: "cutting", label: "Cutting", states: [OrderProcessingState.ORDER_FULFILLED, OrderProcessingState.CUTTING_END] },
  { key: "stitching", label: "Stitching", states: [OrderProcessingState.STITCHING_END] },
  { key: "finishing_qc", label: "Finishing & QC", states: [OrderProcessingState.PRODUCT_VERIFIED_OR_RECTIFIED, OrderProcessingState.MATERIAL_PACKED] },
  { key: "ready_to_dispatch", label: "Ready to Dispatch", states: [OrderProcessingState.READY_FOR_DISPATCH] },
  { key: "delivered", label: "Delivered", states: [OrderProcessingState.ORDER_COMPLETE] },
];

export function getPrimaryGroupIndex(state?: string | null): number {
  const idx = PRIMARY_STAGE_GROUPS.findIndex((g) => g.states.includes(state as OrderProcessingState));
  return idx === -1 ? 0 : idx;
}

/**
 * Which processing stage should a role's "queue" surface as work waiting
 * on them. e.g. Cutting staff should see orders sitting in ORDER_FULFILLED
 * (fabric fulfilled, waiting to be cut) — once they mark it done it becomes
 * CUTTING_END and drops into the Stitching queue.
 */
export const ROLE_QUEUE_STAGE: Record<string, OrderProcessingState> = {
  CUTTING: OrderProcessingState.ORDER_FULFILLED,
  STITCHING: OrderProcessingState.CUTTING_END,
};

/** The stage a role moves an order INTO once they finish their queue item. */
export const ROLE_COMPLETION_STAGE: Record<string, OrderProcessingState> = {
  CUTTING: OrderProcessingState.CUTTING_END,
  STITCHING: OrderProcessingState.STITCHING_END,
};

export const ROLE_QUEUE_TITLE: Record<string, string> = {
  CUTTING: "Cutting Queue",
  STITCHING: "Stitching Queue",
};

/** Days/hours remaining until delivery, with an urgency bucket for styling. */
export const getDeliveryUrgency = (
  appointmentDate?: string | null,
): { label: string; level: "overdue" | "urgent" | "soon" | "normal" | "unknown" } => {
  if (!appointmentDate || isNaN(new Date(appointmentDate).getTime())) {
    return { label: "No delivery date", level: "unknown" };
  }

  const diffMs = new Date(appointmentDate).getTime() - Date.now();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) {
    const overdueDays = Math.abs(Math.floor(diffHours / 24));
    return {
      label: overdueDays >= 1 ? `Overdue by ${overdueDays}d` : "Overdue",
      level: "overdue",
    };
  }
  if (diffHours < 24) {
    return { label: `${Math.floor(diffHours)}h left`, level: "urgent" };
  }
  if (diffHours < 72) {
    return { label: `${Math.floor(diffHours / 24)}d left`, level: "soon" };
  }
  return { label: `${Math.floor(diffHours / 24)}d left`, level: "normal" };
};

export const URGENCY_STYLES: Record<string, string> = {
  overdue: "bg-red-50 text-red-700 border-red-200",
  urgent: "bg-orange-50 text-orange-700 border-orange-200",
  soon: "bg-amber-50 text-amber-700 border-amber-200",
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unknown: "bg-gray-50 text-gray-600 border-gray-200",
};
