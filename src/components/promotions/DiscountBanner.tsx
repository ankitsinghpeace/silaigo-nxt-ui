import React from "react";
import { BadgePercent, ArrowRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DiscountBannerProps {
  discount: string;
  title: string;
  description: string;
  code: string;
  expiry?: string;
  onClick: () => void;
}

const DiscountBanner: React.FC<DiscountBannerProps> = ({
  discount,
  title,
  description,
  code,
  expiry,
  onClick,
}) => {
  const { toast } = useToast();

  const handleClick = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: `Offer code ${code} copied to clipboard`,
    });
    onClick();
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
      <div className="p-6 md:p-8 relative">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 opacity-20">
          <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="75" cy="75" r="75" fill="white" />
            <circle
              cx="75"
              cy="75"
              r="55"
              fill="transparent"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx="75"
              cy="75"
              r="35"
              fill="transparent"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
            <div className="bg-white text-indigo-600 rounded-full p-3 mb-4 md:mb-0 md:mr-6">
              <BadgePercent className="w-10 h-10" />
            </div>

            <div className="text-center md:text-left">
              <div className="bg-white/20 px-3 py-1 rounded-full inline-block text-white text-sm font-medium mb-2">
                {discount} OFF
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {title}
              </h3>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                {description}
              </p>

              {expiry && (
                <div className="mt-2 text-white/90 text-sm font-medium">
                  Expires: {expiry}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 mb-3">
              <span className="font-mono font-bold text-white text-lg">
                {code}
              </span>
            </div>
            <Button
              onClick={handleClick}
              className="bg-white text-indigo-600 hover:bg-white/90 px-4 flex items-center"
            >
              <span>Redeem Now</span>
              <Copy className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
