"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderProcessingState } from "@/types/enums";
import { PRIMARY_STAGE_GROUPS, getPrimaryGroupIndex } from "@/lib/orderStageConfig";

interface OrderStatusStepperProps {
  processingState: OrderProcessingState | string;
}

/**
 * Simplified, visual internal-order stepper (section 27 of the workflow
 * redesign): groups the fine-grained processing states into one clean
 * primary progression instead of a flat dropdown list of 10 overlapping
 * statuses.
 */
const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ processingState }) => {
  const activeIndex = getPrimaryGroupIndex(processingState);

  return (
    <div
      className="flex flex-wrap gap-y-4 sm:flex-nowrap sm:overflow-x-auto"
      data-testid="order-status-stepper"
    >
      {PRIMARY_STAGE_GROUPS.map((group, i) => {
        const done = i < activeIndex;
        const isCurrent = i === activeIndex;
        const isLast = i === PRIMARY_STAGE_GROUPS.length - 1;

        return (
          <div key={group.key} className={cn("flex min-w-[86px] flex-col items-center", !isLast && "flex-1")}>
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground",
                )}
                data-testid={`admin-stepper-node-${group.key}`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {!isLast && (
                <div className={cn("h-0.5 flex-1", done ? "bg-primary" : "bg-muted-foreground/20")} />
              )}
            </div>
            <span
              className={cn(
                "mt-1.5 text-center text-[10px] font-medium leading-tight",
                isCurrent ? "text-primary" : "text-muted-foreground",
              )}
            >
              {group.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusStepper;
