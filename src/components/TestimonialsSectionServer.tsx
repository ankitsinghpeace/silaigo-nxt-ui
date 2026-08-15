/**
 * TestimonialsSectionServer - Server Component that fetches testimonials data.
 * 
 * This component fetches testimonials on the server with proper caching
 * and passes them to the client-side TestimonialsSection for carousel interactions.
 */

import { getPageSectionData } from "@/lib/server-data";
import { Testimonial } from "@/types/interface";
import TestimonialsSectionClient from "./TestimonialsSectionClient";

interface TestimonialsSectionServerProps {
  onReady?: () => void;
}

export default async function TestimonialsSectionServer({ 
  onReady 
}: TestimonialsSectionServerProps) {
  let testimonials: Testimonial[] | null = null;

  try {
    const data = await getPageSectionData("testimonials");
    testimonials = data?.testimonials || null;
  } catch (error) {
    console.error("TestimonialsSectionServer: Failed to fetch testimonials", error);
  }

  if (!testimonials) {
    return null;
  }

  return <TestimonialsSectionClient testimonials={testimonials} onReady={onReady} />;
}