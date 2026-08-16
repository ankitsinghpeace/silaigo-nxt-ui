"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CUSTOMER_STAGE_LABELS,
  CUSTOMER_STAGE_SEQUENCE,
  CUSTOMER_STAGE_DESCRIPTIONS,
  CustomerStage,
} from "@/lib/customerStatusMap";

interface CustomerStatusStepperProps {
  stage: CustomerStage;
  pickupScheduledLabel?: string | null;
}

/**
 * Customer-safe order tracker. Never render internal fields (assignee
 * names, urgency, timestamps) through this component.
 */
const CustomerStatusStepper: React.FC<CustomerStatusStepperProps> = ({
  stage,
  pickupScheduledLabel,
}) => {
  const isAltered = stage === "returned_for_alteration";
  const activeIndex = isAltered
    ? CUSTOMER_STAGE_SEQUENCE.indexOf("stitching")
    : CUSTOMER_STAGE_SEQUENCE.indexOf(stage);

  return (
    <div data-testid="customer-status-stepper" className="space-y-4">
      {isAltered && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          data-testid="alteration-banner"
        >
          {CUSTOMER_STAGE_DESCRIPTIONS.returned_for_alteration}
        </div>
      )}

      {pickupScheduledLabel && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-emerald-600" />
          {CUSTOMER_STAGE_LABELS.pickup_scheduled}: {pickupScheduledLabel}
        </div>
      )}

      <div className="flex items-start">
        {CUSTOMER_STAGE_SEQUENCE.map((s, i) => {
          const done = i < activeIndex || (i === activeIndex && !isAltered);
          const isCurrent = i === activeIndex;
          const isLast = i === CUSTOMER_STAGE_SEQUENCE.length - 1;

          return (
            <div key={s} className={cn("flex flex-col items-center", !isLast && "flex-1")}>
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                  data-testid={`stepper-node-${s}`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      i < activeIndex ? "bg-primary" : "bg-muted-foreground/20",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 max-w-[80px] text-center text-[11px] font-medium leading-tight sm:max-w-none sm:text-xs",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {CUSTOMER_STAGE_LABELS[s]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground" data-testid="stepper-description">
        {CUSTOMER_STAGE_DESCRIPTIONS[stage]}
      </p>
    </div>
  );
};

export default CustomerStatusStepper;
