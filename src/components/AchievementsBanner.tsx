import { Achievement } from "@/types/interface";
import { Users, Star, Award, FileText } from "lucide-react";
import { getPageSectionData } from "@/lib/server-data";

interface AchievementsBannerProps {
  achievements?: Achievement[];
}

const defaultAchievements: Achievement[] = [];

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

const AchievementsBanner = async ({
  achievements: initialAchievements,
}: AchievementsBannerProps) => {
  let achievements = initialAchievements;

  if (!achievements) {
    try {
      const data = await getPageSectionData("achievements");
      achievements = data?.achievements ?? [];
    } catch (error) {
      console.error("Error fetching achievements:", error);
      achievements = defaultAchievements;
    }
  }

  if (!achievements.length) return null;

  // Repeat achievements to create a seamless loop effect
  const repeatedAchievements = [...achievements, ...achievements];

  return (
    <div className="overflow-hidden bg-primary py-6">
      <div className="relative flex overflow-x-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {repeatedAchievements.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="mx-6 flex min-w-[160px] items-center justify-center"
            >
              <div className="mr-3 rounded-full bg-white/10 p-2">
                {getIconComponent(item.icon)}
              </div>

              <div className="text-white">
                <div className="text-base font-bold md:text-xl">
                  {item.value}
                </div>

                <div className="text-xs opacity-80 md:text-sm">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AchievementsBanner;
