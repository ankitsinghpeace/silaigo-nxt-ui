import { OrderProcessingState } from "@/types/enums";

/**
 * Customer-facing tracking stages.
 *
 * These are intentionally simpler than the internal `OrderProcessingState`
 * enum — no assignee names, no urgency, no internal timestamps, no
 * cutting/stitching-agent identities are ever exposed here.
 */
export type CustomerStage =
  | "pickup_scheduled"
  | "order_received"
  | "cutting"
  | "stitching"
  | "qc_ready"
  | "delivered"
  | "returned_for_alteration";

export const CUSTOMER_STAGE_LABELS: Record<CustomerStage, string> = {
  pickup_scheduled: "Pickup Scheduled",
  order_received: "Order Received",
  cutting: "Cutting",
  stitching: "Stitching",
  qc_ready: "QC & Ready to Dispatch",
  delivered: "Delivered",
  returned_for_alteration: "Returned for Alteration",
};

export const CUSTOMER_STAGE_DESCRIPTIONS: Record<CustomerStage, string> = {
  pickup_scheduled: "Our pickup agent will collect your order as scheduled.",
  order_received: "We've received your order and it's being prepared.",
  cutting: "Your order has moved to cutting.",
  stitching: "Your order is now being stitched.",
  qc_ready: "Your order has passed quality checks and is ready to dispatch.",
  delivered: "Your order has been delivered. Thank you for choosing Silaigo!",
  returned_for_alteration:
    "We're making a quick alteration to get this perfect for you.",
};

/** Main visual sequence shown to the customer (pickup step is prefixed only when known). */
export const CUSTOMER_STAGE_SEQUENCE: CustomerStage[] = [
  "order_received",
  "cutting",
  "stitching",
  "qc_ready",
  "delivered",
];

/**
 * Best-effort mapping from the internal production enum to a customer-safe
 * stage. This is a pure display transform — it never reads or exposes
 * assignee names, urgency, or internal notes.
 *
 * NOTE: once the backend adds an explicit `isReturnedForAlteration` flag
 * (see be_changes2.md), pass it here to override the mapping.
 */
export function mapProcessingStateToCustomerStage(
  processingState?: string | null,
  isReturnedForAlteration?: boolean,
): CustomerStage {
  if (isReturnedForAlteration) return "returned_for_alteration";

  switch (processingState) {
    case OrderProcessingState.ORDER_INITIATED:
    case OrderProcessingState.ORDER_PLACED:
    case OrderProcessingState.MATERIAL_DELIVERED_TO_WORKSHOP:
      return "order_received";
    case OrderProcessingState.ORDER_FULFILLED:
    case OrderProcessingState.CUTTING_IN_PROGRESS:
      return "cutting";
    case OrderProcessingState.CUTTING_COMPLETE:
    case OrderProcessingState.STITCHING_IN_PROGRESS:
      return "stitching";
    case OrderProcessingState.STITCHING_COMPLETE:
    case OrderProcessingState.PRODUCT_VERIFIED_OR_RECTIFIED:
    case OrderProcessingState.MATERIAL_PACKED:
    case OrderProcessingState.READY_FOR_DISPATCH:
      return "qc_ready";
    case OrderProcessingState.ORDER_COMPLETE:
      return "delivered";
    default:
      return "order_received";
  }
}

export function getCustomerStageIndex(stage: CustomerStage): number {
  if (stage === "returned_for_alteration") return 2; // sits visually around "stitching"
  return CUSTOMER_STAGE_SEQUENCE.indexOf(stage);
}
