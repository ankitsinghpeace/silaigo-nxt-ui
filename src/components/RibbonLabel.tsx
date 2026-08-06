import React from "react";

interface RibbonLabelProps {
  text: string;
}

const RibbonLabel: React.FC<RibbonLabelProps> = ({ text }) => {
  return (
    <div
      className="absolute top-0 right-2 md:right-6 w-20 h-20 overflow-visible z-20 pointer-events-none"
      style={{ right: "-0.75rem" }}
    >
      <div
        className="
          absolute
          px-4 sm:px-6
          -right-5 sm:-right-8
          top-5 sm:top-6
          w-32 sm:w-[150px]
          rotate-45
          bg-[#FF6F61] bg-opacity-80
          text-white
          text-[10px] sm:text-xs
          font-semibold
          text-center
          py-1 sm:py-2
          rounded-sm
          max-sm:text-[9px]
          whitespace-nowrap
        "
      >
        {text}
      </div>
    </div>
  );
};

export default RibbonLabel;
