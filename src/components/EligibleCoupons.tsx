import { getEligibleCouponsApi } from "@/services/modules/orders.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Calendar, Clock, Copy } from "lucide-react";
import { format } from "date-fns";

interface Coupon {
  code: string;
  maxDiscount: number;
  amount: number;
  validTill: string;
  minOrderValue: number;
  nthOrder: number;
}

interface EligibleCouponsProps {
  isOpen: boolean;
  onClose?: () => void;
}

const formatValidTill = (validTill: string) => {
  try {
    return format(new Date(validTill), "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
};

const formatNthOrder = (nthOrder: number) => {
  if (nthOrder === 1) return "1st";
  if (nthOrder === 2) return "2nd";
  if (nthOrder === 3) return "3rd";

  return `${nthOrder}th`;
};

const EligibleCoupons = async ({ isOpen, onClose }: EligibleCouponsProps) => {
  if (!isOpen) {
    return null;
  }

  let coupons: Coupon[] = [];

  try {
    coupons = await getEligibleCouponsApi();
  } catch (error) {
    console.error("Failed to load eligible coupons:", error);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Available Coupons
            </DialogTitle>

            <DialogDescription>
              Failed to load available coupons. Please try again.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift className="mb-4 h-12 w-12 text-gray-400" />

            <p className="mb-4 text-gray-600">
              Something went wrong while loading coupons.
            </p>

            {onClose && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Coupons
          </DialogTitle>

          <DialogDescription>
            Coupons currently available for your order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {coupons.length === 0 ? (
            <div className="py-8 text-center">
              <Gift className="mx-auto mb-4 h-12 w-12 text-gray-400" />

              <p className="mb-2 text-gray-600">No coupons available</p>

              <p className="text-sm text-gray-500">
                Try increasing your order amount to unlock more coupons.
              </p>
            </div>
          ) : (
            coupons.map((coupon, index) => (
              <Card
                key={`${coupon.code}-${index}`}
                className="border-2 transition-colors hover:border-primary/50"
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary">
                        Save ₹{coupon.amount}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Valid till: {formatValidTill(coupon.validTill)}
                          </span>
                        </div>

                        {coupon.minOrderValue > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Min: ₹{coupon.minOrderValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <div className="flex-1">
                      <span className="font-mono text-lg font-bold text-gray-900">
                        {coupon.code}
                      </span>
                    </div>

                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500"
                      title="Copy coupon code"
                      aria-label={`Coupon code ${coupon.code}`}
                    >
                      <Copy className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    {coupon.minOrderValue > 0 && (
                      <p>• Minimum order value: ₹{coupon.minOrderValue}</p>
                    )}

                    <p>• Maximum discount: ₹{coupon.maxDiscount}</p>

                    <p>• Valid until: {formatValidTill(coupon.validTill)}</p>

                    {coupon.nthOrder > 0 && (
                      <p>
                        • Available for {formatNthOrder(coupon.nthOrder)} order
                        only
                      </p>
                    )}

                    <p>• Cannot be combined with other offers</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end border-t pt-4">
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EligibleCoupons;
