import React from "react";
import { Gift, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfferBannerProps {
  title: string;
  description: string;
  buttonText: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
}

const OfferBanner: React.FC<OfferBannerProps> = ({
  title,
  description,
  buttonText,
  bgColor = "bg-primary",
  textColor = "text-white",
  onClick,
}) => {
  return (
    <div
      className={`w-full p-3 sm:p-4 md:p-6 rounded-xl ${bgColor} ${textColor} relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-12 -top-12 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white"></div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 max-[365px]:gap-2">
        <div className="flex items-start sm:items-center gap-3 max-[365px]:gap-2">
          <Gift className="w-7 h-7 sm:w-8 sm:h-8 mt-1 sm:mt-0" />
          <div>
            <h3 className="text-sm sm:text-base md:text-xl font-bold mb-1 max-[365px]:text-xs">
              {title}
            </h3>
            <p className="text-xs sm:text-sm md:text-base opacity-90 max-[365px]:text-[11px]">
              {description}
            </p>
          </div>
        </div>

        <Button
          onClick={onClick}
          variant="outline"
          className="bg-white text-primary hover:bg-white/90 px-4 py-2 text-sm group w-full sm:w-auto max-[365px]:px-3 max-[365px]:text-xs"
        >
          {buttonText}
          <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default OfferBanner;
