"use client";

import React, { useState } from "react";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomerStatusStepper from "@/components/CustomerStatusStepper";
import { trackOrderPublicApi } from "@/services/modules/orders.api";
import { mapProcessingStateToCustomerStage } from "@/lib/customerStatusMap";

/**
 * Homepage "Track Your Order" widget.
 *
 * PENDING BACKEND: calls `GET /orders/track/:orderId` — a public, no-auth
 * endpoint that must return ONLY customer-safe fields (see be_changes2.md,
 * section "Public order tracking endpoint"). Until that endpoint exists,
 * this fails gracefully with a friendly message.
 */
const TrackOrderSection: React.FC = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleTrack = async () => {
    const id = orderId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await trackOrderPublicApi(id);
      setResult(data);
    } catch (err) {
      setError(
        "We couldn't find that order right now. Please check the Order ID, or sign in and view it under My Orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="section-container py-12 sm:py-16"
      data-testid="track-order-section"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Track Your Order</h2>
            <p className="text-sm text-muted-foreground">
              Enter your Order ID to see the latest status.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="e.g. 04SS0805"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            data-testid="track-order-input"
            className="flex-1"
          />
          <Button
            onClick={handleTrack}
            disabled={loading}
            data-testid="track-order-submit"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" /> Track
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600" data-testid="track-order-error">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-6 border-t pt-6" data-testid="track-order-result">
            <CustomerStatusStepper
              stage={mapProcessingStateToCustomerStage(
                result.processingState,
                result.isReturnedForAlteration,
              )}
              pickupScheduledLabel={result.pickupScheduledLabel}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackOrderSection;
