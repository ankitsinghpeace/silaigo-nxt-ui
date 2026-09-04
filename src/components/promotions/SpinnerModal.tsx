"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Copy, CheckCheck } from "lucide-react";
import { gsap, Power4 } from "gsap";

interface SpinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const rewards = [
  { id: 1, title: "10% OFF", color: "#3B82F6", code: "SPIN10" },
  { id: 2, title: "₹500 OFF", color: "#22C55E", code: "SPIN500" },
  { id: 3, title: "FREE GIFT", color: "#FACC15", code: "SPINGIFT" },
  { id: 4, title: "20% OFF", color: "#8B5CF6", code: "SPIN20" },
  { id: 5, title: "FREE SHIPPING", color: "#EC4899", code: "SPINSHIP" },
  { id: 6, title: "BETTER LUCK", color: "#9CA3AF", code: null },
];

const SpinnerModal: React.FC<SpinnerModalProps> = ({ isOpen, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<(typeof rewards)[0] | null>(null);
  const [progress, setProgress] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const { toast } = useToast();

  const wheelRef = useRef<SVGGElement>(null);
  const indicatorRef = useRef<SVGGElement>(null);
  const [internalDeg, setInternalDeg] = useState(0);

  const canSpin = () => {
    if (typeof window === "undefined") return true;
    const lastSpinDate = localStorage.getItem("lastSpinDate");
    if (!lastSpinDate) return true;
    const lastDate = new Date(lastSpinDate);
    const now = new Date();
    const diff = Math.ceil(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff >= 7;
  };

  const updateSpinDate = () => {
    localStorage.setItem("lastSpinDate", new Date().toISOString());
  };

  const getNextSpinDate = () => {
    const lastSpinDate = localStorage.getItem("lastSpinDate");
    if (!lastSpinDate) return "now";
    const nextDate = new Date(lastSpinDate);
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const copyCode = () => {
    if (wonReward?.code) {
      navigator.clipboard.writeText(wonReward.code);
      setCodeCopied(true);
      toast({
        title: "Code copied!",
        description: "Offer code copied to clipboard",
      });
      setTimeout(() => setCodeCopied(false), 3000);
    }
  };

  const spinWheel = () => {
    if (isSpinning || !canSpin()) return;
    setIsSpinning(true);
    setWonReward(null);
    setProgress(0);

    const fullRotations = Math.floor(Math.random() * 5) + 5;
    const rewardIndex = Math.floor(Math.random() * rewards.length);
    const segmentAngle = 360 / rewards.length;
    const finalRotation = fullRotations * 360 + rewardIndex * segmentAngle;

    gsap.to(wheelRef.current, {
      duration: 5,
      rotation: finalRotation,
      ease: Power4.easeOut,
      transformOrigin: "50% 50%",
      onComplete: () => {
        setIsSpinning(false);
        const selectedReward = rewards[rewardIndex];
        setWonReward(selectedReward);
        updateSpinDate();
        toast({
          title: selectedReward.code
            ? "Congratulations!"
            : "Better luck next time!",
          description: selectedReward.code
            ? `You won: ${selectedReward.title}`
            : "Try again next week!",
        });
      },
      onUpdate: () => {
        const currentRotation = gsap.getProperty(
          wheelRef.current,
          "rotation",
        ) as number;
        const tolerance = currentRotation - internalDeg;
        if (
          currentRotation % segmentAngle <= tolerance &&
          indicatorRef.current
        ) {
          gsap.fromTo(
            indicatorRef.current,
            { rotation: -10 },
            { rotation: 3, transformOrigin: "65% 36%", ease: Power4.easeOut },
          );
        }
        setInternalDeg(currentRotation);
      },
    });

    // Progress animation
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      setProgress(Math.min(100, (currentStep / steps) * 100));
      if (currentStep >= steps) clearInterval(progressInterval);
    }, interval);
  };

  // SVG Pie Utility
  function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angleDeg: number,
  ) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  }

  function describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      x,
      y,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSpinning && onClose()}>
      <DialogContent className="sm:max-w-md w-full max-w-[95vw] max-h-[90vh] overflow-y-auto px-4 py-5 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-center">
            Spin & Win
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-center mt-2 text-muted-foreground">
            Try your luck for exciting discounts and offers
          </DialogDescription>
        </DialogHeader>

        <div className="relative mx-auto w-full max-w-[90vw] aspect-[1/1] my-4 sm:my-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 730 730"
            className="w-full h-auto"
          >
            <g className="wheel shadow-md" ref={wheelRef}>
              <circle cx="365" cy="365" r="347.6" fill="#f3f4f6" />
              {rewards.map((reward, index) => {
                const angle = 360 / rewards.length;
                const start = index * angle;
                const end = start + angle;
                return (
                  <path
                    key={reward.id}
                    d={describeArc(365, 365, 328.5, start, end)}
                    fill={reward.color}
                  />
                );
              })}
            </g>
            <circle
              cx="365"
              cy="365"
              r="54.5"
              fill="#fff"
              className="animate-pulse"
            />
            <circle cx="365" cy="365" r="11.6" fill="#ccc" />
            <g className="active" ref={indicatorRef}>
              <path
                d="M711.9,157.4a38.4,38.4,0,0,0-66,1.8l-31.5,57.5a2.1,2.1,0,0,0,0,2.4,2.6,2.6,0,0,0,2.2,1.2l65.6-3.9a39.6,39.6,0,0,0,17.9-5.9A38.5,38.5,0,0,0,711.9,157.4Z"
                fill="#ef4444"
              />
            </g>
          </svg>
        </div>

        <div className="text-center text-sm text-muted-foreground mb-4">
          {isSpinning
            ? "Wheel is spinning..."
            : "Spin the wheel to win amazing offers!"}
        </div>

        {isSpinning && (
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-gray-500 mt-1">
              Spinning your luck...
            </p>
          </div>
        )}

        {wonReward && wonReward.code && (
          <div className="bg-gray-50 p-4 rounded-xl text-center mb-4 border border-gray-200">
            <h3 className="font-bold text-lg">Congratulations!</h3>
            <p className="text-lg font-bold text-primary my-2">
              {wonReward.title}
            </p>
            <div className="flex items-center justify-center mt-2">
              <div className="bg-white px-4 py-2 rounded-lg border border-dashed border-gray-300 inline-flex items-center">
                <span className="font-mono font-bold text-gray-900 mr-2">
                  {wonReward.code}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={copyCode}
                >
                  {codeCopied ? (
                    <CheckCheck className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Use this code at checkout
            </p>
          </div>
        )}

        {wonReward && !wonReward.code && (
          <div className="bg-gray-50 p-4 rounded-xl text-center mb-4 border border-gray-200">
            <h3 className="font-bold text-lg">Better luck next time!</h3>
            <p className="text-sm text-gray-500 mt-2">
              Try again next week for another chance to win
            </p>
          </div>
        )}

        {!canSpin() && !isSpinning && !wonReward && (
          <div className="bg-gray-50 p-4 rounded-xl text-center mb-4 border border-gray-200">
            <h3 className="font-bold text-lg">You've already spun this week</h3>
            <p className="text-sm text-gray-500 mt-2">
              Come back on {getNextSpinDate()} for another chance to win
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={spinWheel}
            disabled={isSpinning || !canSpin()}
            className="w-full sm:w-auto"
          >
            {isSpinning ? "Spinning..." : "Spin Now"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSpinning}
            className="w-full sm:w-auto"
          >
            {wonReward ? "Claim & Close" : "Maybe Later"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpinnerModal;
