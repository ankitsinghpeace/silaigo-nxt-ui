"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const referralCode = "FRIEND20";
  const referralLink = `https://silai.go/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Get 20% off at Silai Go",
        text: "Use my referral link to get 20% off your first order at Silai Go!",
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">
              Refer & Earn 20% Discount
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              Share with friends and you both get 20% off your next order
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="bg-gray-100 p-3 rounded-lg w-full mb-4 relative">
            <input
              type="text"
              value={referralLink}
              className="w-full bg-transparent border-none focus:outline-none pr-10 font-mono text-sm"
              readOnly
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="border border-dashed border-gray-300 rounded-lg p-4 w-full mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Your Reward</h4>
                <p className="text-sm text-gray-500">20% off your next order</p>
              </div>
              <div className="text-2xl font-bold text-primary">20%</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Friend's Reward</h4>
                  <p className="text-sm text-gray-500">First order discount</p>
                </div>
                <div className="text-2xl font-bold text-primary">20%</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:gap-0">
          <Button onClick={handleShare} className="w-full gap-2">
            <Share2 className="h-4 w-4" />
            Share Link
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full mt-2">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralModal;
