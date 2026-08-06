"use client";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, X, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  discount: string;
  code: string;
}

const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  discount,
  code,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  // Copy code automatically when modal opens
  useEffect(() => {
    if (isOpen && code) {
      navigator.clipboard.writeText(code);
      toast({
        title: "Code copied!",
        description: `Offer code ${code} copied to clipboard`,
      });
      setCopied(true);
    }
  }, [isOpen, code, toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied again!",
      description: `Offer code ${code} copied to clipboard`,
    });
    setCopied(true);
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div className="text-4xl font-bold text-primary mb-2">{discount}</div>
          <div className="bg-gray-100 py-2 px-6 rounded-full border border-dashed border-gray-300 text-center flex items-center">
            <span className="font-mono font-semibold text-gray-800 mr-2">
              {code}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-6 w-6 hover:bg-gray-200"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:gap-0">
          <Button onClick={handleClose} className="w-full">
            Continue Shopping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfferModal;
