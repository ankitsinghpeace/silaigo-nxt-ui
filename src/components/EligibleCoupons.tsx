"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Gift, Loader2, AlertCircle, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  onClose: () => void;
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

const EligibleCoupons: React.FC<EligibleCouponsProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const {
    data: coupons = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["eligible-coupons"],
    queryFn: () => getEligibleCouponsApi(),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Code copied!",
        description: `Coupon code ${code} copied to clipboard`,
      });

      setTimeout(() => {
        setCopiedCode(null);
      }, 3000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };



  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Available Coupons
            </DialogTitle>
            <DialogDescription>
              Loading available coupons for your order...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error Loading Coupons
            </DialogTitle>
            <DialogDescription>
              Failed to load available coupons. Please try again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-600 mb-4">
              {error?.message || "Something went wrong while loading coupons"}
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Coupons
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {coupons.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No coupons available</p>
              <p className="text-sm text-gray-500">
                Try increasing your order amount to unlock more coupons
              </p>
            </div>
          ) : (
            coupons.map((coupon: Coupon, index: number) => {

              return (
                <Card key={`${coupon.code}-${index}`} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                            <h3 className="font-semibold text-lg text-primary">
                              Save {coupon.amount}
                            </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Valid till: {formatValidTill(coupon.validTill)}</span>
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

                    <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-mono font-bold text-gray-900 text-lg">
                          {coupon.code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(coupon.code)}
                        className="h-8 w-8 p-0 hover:bg-gray-200"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      {coupon.minOrderValue > 0 && (
                        <p>• Minimum order value: ₹{coupon.minOrderValue}</p>
                      )}
                      <p>• Maximum discount: ₹{coupon.maxDiscount}</p>
                      <p>• Valid until: {formatValidTill(coupon.validTill)}</p>
                      {coupon.nthOrder > 0 && (
                        <p>• Available for {formatNthOrder(coupon.nthOrder)} order only</p>
                      )}
                      <p>• Cannot be combined with other offers</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EligibleCoupons;
