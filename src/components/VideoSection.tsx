"use client";
import React, { useEffect, useState } from "react";
import { VideoCard } from "@/types/interface";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchPageSectionData } from "@/services";

interface VideoSectionProps {
  onReady?: (videos: VideoCard[]) => void;
}

const VideoSection = ({ onReady }: VideoSectionProps) => {
  const [videosData, setVideosData] = useState<VideoCard[] | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadJourneyData = async () => {
      try {
        const data = await fetchPageSectionData("videos");
        setVideosData(data.videos);

        if (onReady) {
          onReady(data.videos);
        }
      } catch (error) {
        console.error("Error fetching journey data:", error);
      }
    };
    loadJourneyData();
  }, [onReady]);

  if (!videosData) return null;

  const openVideoModal = (video: VideoCard) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="w-full bg-gradient-to-b from-secondary/50 to-secondary/10">
      <div className="w-full px-4 sm:px-6 lg:px-16 py-6 bg-white">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            Featured Videos
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
            Watch our exclusive collection showcasing our craftsmanship and
            designs.
          </p>
        </div>

        {/* === Mobile View === */}
        <div className="block md:hidden">
          <Carousel opts={{ align: "center", loop: true }} className="w-full">
            <CarouselContent>
              {videosData.map((video) => (
                <CarouselItem key={video.title} className="basis-1/2 px-[2px]">
                  <div
                    className="group relative w-full h-40 sm:h-48 overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 bg-gray-50 cursor-pointer"
                    onClick={() => openVideoModal(video)}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl">
                      <Play className="text-white w-10 h-10 mb-2 animate-pulse" />
                      <h3 className="text-sm font-semibold text-white text-center px-2">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* === Desktop View === */}
        <div className="hidden md:block">
          <Carousel opts={{ align: "center", loop: true }} className="w-full">
            <CarouselContent>
              {videosData.map((video) => (
                <CarouselItem key={video.title} className="basis-full px-[1px]">
                  <div
                    className="group mb-8 relative w-full h-[420px] lg:h-[460px] overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 bg-gray-50 cursor-pointer"
                    onClick={() => openVideoModal(video)}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl">
                      <Play className="text-white w-16 h-16 mb-4 animate-pulse" />
                      <h3 className="text-xl font-semibold text-white text-center max-w-lg px-4">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>

      {/* === Modal shared between both views === */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <div className="relative w-full h-0 pb-[56.25%]">
            {selectedVideo && (
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                allow="autoplay; fullscreen"
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
            )}
            <button
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
              onClick={closeVideoModal}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default VideoSection;
