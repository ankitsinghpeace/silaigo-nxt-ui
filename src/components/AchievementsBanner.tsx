"use client";
import React, { useEffect, useState } from "react";
import { Achievement } from "@/types/interface";
import { Users, Star, Award, FileText } from "lucide-react";
import { fetchPageSectionData } from "@/services";

interface AchievementsBannerProps {
  onReady?: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 1, icon: "users", value: "1200+", label: "Happy Customers", isActive: true },
  { id: 2, icon: "star", value: "4.8★", label: "Rated Service", isActive: true },
  { id: 3, icon: "award", value: "2+ Years", label: "of Excellence", isActive: true },
  { id: 4, icon: "needle-thread", value: "48 hrs", label: "Turnaround Time", isActive: true },
  { id: 5, icon: "scissors", value: "6000+", label: "Garments Stitched", isActive: true },
];

const AchievementsBanner: React.FC<AchievementsBannerProps> = ({ onReady }) => {
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPageSectionData("achievements");
        if (Array.isArray(data?.achievements) && data.achievements.length > 0) {
          setAchievements(data.achievements);
        } else {
          setAchievements(DEFAULT_ACHIEVEMENTS);
        }
        onReady?.();
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setAchievements(DEFAULT_ACHIEVEMENTS);
        onReady?.();
      }
    };
    loadData();
  }, [onReady]);

  if (!achievements || achievements.length === 0) return null;

  const getIconComponent = (iconName?: string) => {
    const key = (iconName || "").toLowerCase();
    switch (key) {
      case "users":
        return <Users size={26} className="text-white" />;
      case "star":
        return <Star size={26} className="text-white" />;
      case "award":
        return <Award size={26} className="text-white" />;
      case "needle-thread":
      case "scissors":
      case "shirt":
        return <FileText size={26} className="text-white" />;
      default:
        return <Award size={26} className="text-white" />;
    }
  };

  // Repeat items 4 times so a single track fills any widescreen viewport cleanly
  const trackItems = [
    ...achievements,
    ...achievements,
    ...achievements,
    ...achievements,
  ];

  return (
    <div className="bg-primary py-4 overflow-hidden select-none">
      <div className="flex w-full overflow-hidden">
        {/* Track 1 */}
        <div className="flex shrink-0 items-center justify-around min-w-full animate-marquee">
          {trackItems.map((item, index) => (
            <div
              key={`t1-${item.id}-${index}`}
              className="flex items-center justify-center mx-6 min-w-[170px]"
            >
              <div className="p-2 rounded-full bg-white/15 mr-3 shrink-0">
                {getIconComponent(item.icon)}
              </div>
              <div className="text-white">
                <div className="text-base md:text-lg font-bold leading-tight">
                  {item.value}
                </div>
                <div className="text-xs md:text-sm opacity-85 leading-tight">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Track 2 (Duplicate for Seamless Infinite Loop with ZERO gap) */}
        <div
          className="flex shrink-0 items-center justify-around min-w-full animate-marquee"
          aria-hidden="true"
        >
          {trackItems.map((item, index) => (
            <div
              key={`t2-${item.id}-${index}`}
              className="flex items-center justify-center mx-6 min-w-[170px]"
            >
              <div className="p-2 rounded-full bg-white/15 mr-3 shrink-0">
                {getIconComponent(item.icon)}
              </div>
              <div className="text-white">
                <div className="text-base md:text-lg font-bold leading-tight">
                  {item.value}
                </div>
                <div className="text-xs md:text-sm opacity-85 leading-tight">
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
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 90s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AchievementsBanner;
