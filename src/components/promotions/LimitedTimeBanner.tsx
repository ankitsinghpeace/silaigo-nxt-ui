import React from "react";
import { Clock, ArrowRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LimitedTimeBannerProps {
  title: string;
  description: string;
  timeLeft: string;
  onClick: () => void;
  couponCode?: string;
}

const LimitedTimeBanner: React.FC<LimitedTimeBannerProps> = ({
  title,
  description,
  timeLeft,
  onClick,
  couponCode,
}) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      toast({
        title: "Code copied!",
        description: `Coupon code ${couponCode} copied to clipboard`,
      });
    }
    onClick();
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
      <div className="p-3 xs:p-4 md:p-6 relative">
        <div className="flex flex-col sm:flex-row md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
              <Clock className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {title}
              </h3>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2 justify-center sm:flex-col sm:items-center">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 sm:mb-1 max-[380px]:w-3/5">
              <span className="font-mono font-normal sm:font-semibold text-white max-[380px]:text-sm text-base sm:text-lg">
                {timeLeft}
              </span>
            </div>
            <Button
              onClick={handleClick}
              className="bg-white text-orange-600 hover:bg-white/90 px-4 flex items-center max-[380px]:text-xs text-sm sm:text-base max-[380px]:w-2/5"
            >
              <span>Shop Now</span>
              {couponCode ? (
                <Copy className="max-[380px]:ml-0.5 ml-2 w-4 h-4" />
              ) : (
                <ArrowRight className="ml-2 w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitedTimeBanner;
