"use client";
import React, { useEffect, useState } from "react";
import { Achievement } from "@/types/interface";
import { Users, Star, Award, FileText } from "lucide-react";
import { fetchPageSectionData } from "@/services";

interface AchievementsBannerProps {
  onReady?: () => void;
}

const AchievementsBanner: React.FC<AchievementsBannerProps> = ({ onReady }) => {
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPageSectionData("achievements");
        setAchievements(data.achievements);
        // Since no images to load, consider ready here
        onReady?.();
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };
    loadData();
  }, [onReady]);

  if (!achievements) return null;

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "users":
        return <Users size={32} className="text-primary" />;
      case "star":
        return <Star size={32} className="text-primary" />;
      case "award":
        return <Award size={32} className="text-primary" />;
      case "needle-thread":
        return <FileText size={32} className="text-primary" />;
      default:
        return <Award size={32} className="text-primary" />;
    }
  };

  // Repeat achievements to create a loop effect
  const repeatedAchievements = [...achievements, ...achievements];

  return (
    <div className="bg-primary py-6 overflow-hidden">
      <div className="relative flex overflow-x-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {repeatedAchievements.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center justify-center mx-6 min-w-[160px]"
            >
              <div className="p-2 rounded-full bg-white/10 mr-3">
                {getIconComponent(item.icon)}
              </div>
              <div className="text-white">
                <div className="text-base md:text-xl font-bold">
                  {item.value}
                </div>
                <div className="text-xs md:text-sm opacity-80">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AchievementsBanner;
