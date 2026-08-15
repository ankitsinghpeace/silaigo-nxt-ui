/**
 * VideoSectionServer - Server Component that fetches video data.
 * 
 * This component fetches videos on the server with proper caching
 * and passes them to the client-side VideoSection for video modal interactions.
 */

import { getPageSectionData } from "@/lib/server-data";
import { VideoCard } from "@/types/interface";
import VideoSectionClient from "./VideoSectionClient";

interface VideoSectionServerProps {
  onReady?: (videos: VideoCard[]) => void;
}

export default async function VideoSectionServer({ 
  onReady 
}: VideoSectionServerProps) {
  let videos: VideoCard[] | null = null;

  try {
    const data = await getPageSectionData("videos");
    videos = data?.videos || null;
  } catch (error) {
    console.error("VideoSectionServer: Failed to fetch videos", error);
  }

  if (!videos) {
    return null;
  }

  return <VideoSectionClient videos={videos} onReady={onReady} />;
}