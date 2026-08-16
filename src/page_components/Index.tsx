import React from "react";
import HeroCarousel from "@/components/HeroCarousel";
import JourneySection from "@/components/JourneySection";
import TrackOrderSection from "@/components/TrackOrderSection";
import AchievementsBanner from "@/components/AchievementsBanner";
import CategorySectionServer from "@/components/CategorySectionServer";
import VideoSectionServer from "@/components/VideoSectionServer";
import PartnersBanner from "@/components/PartnersBanner";
import TestimonialsSectionServer from "@/components/TestimonialsSectionServer";
import FnqSection from "@/components/FnqSection";

import { MetaTagsProvider } from "@/components/MetaTagsProvider";

const Index = async () => {
  return (
    <>
      <MetaTagsProvider
        title="Tailoring At Your Doorstep in 48 Hours | Silaigo"
        description="Get your suits, kurtis & blouses stitched and delivered in just 48 hours. Silaigo offers doorstep tailoring with pickup and measurement in Noida."
        keywords="suits stitching Noida, kurtis stitching Noida, blouses stitching Noida, doorstep tailoring Noida, tailoring pickup Noida, measurement service Noida, custom tailoring Noida, stitched suits delivery, stitched kurtis delivery, stitched blouses delivery, tailoring service in Noida, quick tailoring Noida, 48 hours tailoring Noida"
        canonicalPath="/"
      />
      <h1 style={{ display: "none" }}>
        Affordable Tailoring Services in Noida with Free Home Pickup
      </h1>
      <div id="homepage-container" className="flex flex-col overflow-x-hidden">
        <HeroCarousel />
        <TrackOrderSection />
        <JourneySection />
        <AchievementsBanner />
        <CategorySectionServer />
        <VideoSectionServer />
        <PartnersBanner />
        <TestimonialsSectionServer />
        <FnqSection />
      </div>
    </>
  );
};

export default Index;
