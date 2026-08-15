"use client";

import React, { useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import JourneySection from "@/components/JourneySection";
import AchievementsBanner from "@/components/AchievementsBanner";
import CategorySectionServer from "@/components/CategorySectionServer";
import VideoSectionServer from "@/components/VideoSectionServer";
import PartnersBanner from "@/components/PartnersBanner";
import TestimonialsSectionServer from "@/components/TestimonialsSectionServer";
import FnqSection from "@/components/FnqSection";
import SpinnerModal from "@/components/promotions/SpinnerModal";
import { useToast } from "@/hooks/use-toast";
import { useRandomPopup } from "@/hooks/use-random-popup";

import { MetaTagsProvider } from "@/components/MetaTagsProvider";

const Index: React.FC = () => {
  const [heroReady, setHeroReady] = useState(false);
  const [journeyReady, setJourneyReady] = useState(false);
  const [achievementsReady, setAchievementsReady] = useState(false);
  const [categoryReady, setCategoryReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [partnersReady, setPartnersReady] = useState(false);
  const [testimonialsReady, setTestimonialsReady] = useState(false);
  const [fnqReady, setFnqReady] = useState(false);

  const allReady =
    heroReady &&
    journeyReady &&
    achievementsReady &&
    categoryReady &&
    videoReady &&
    partnersReady &&
    testimonialsReady &&
    fnqReady;

  const { isOpen: isSpinnerOpen, closePopup: closeSpinner } = useRandomPopup({
    minDelay: 30000,
    maxDelay: 60000,
    enabled: true,
    showOnce: false,
  });

  const whatsappUrl = "https://wa.me/";

  if (!allReady && false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary font-medium">Loading. ..</p>
        </div>
      </div>
    );
  }

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
      {/* <SpinnerModal isOpen={isSpinnerOpen} onClose={closeSpinner} /> */}
      <div id="homepage-container" className="flex flex-col overflow-x-hidden">
        <HeroCarousel onReady={() => setHeroReady(true)} />
        <JourneySection onReady={() => setJourneyReady(true)} />
        <AchievementsBanner onReady={() => setAchievementsReady(true)} />
        <CategorySectionServer onReady={() => setCategoryReady(true)} />
        <VideoSectionServer onReady={() => setVideoReady(true)} />
        <PartnersBanner onReady={() => setPartnersReady(true)} />
        <TestimonialsSectionServer onReady={() => setTestimonialsReady(true)} />
        <FnqSection onReady={() => setFnqReady(true)} />
      </div>
    </>
  );
};

export default Index;
