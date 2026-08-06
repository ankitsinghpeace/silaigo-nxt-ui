"use client";
import React, { useState, useEffect } from "react";
import { Testimonial } from "@/types/interface";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchPageSectionData } from "@/services";

interface TestimonialsSectionProps {
  onReady?: () => void;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onReady,
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [hasCalledReady, setHasCalledReady] = useState(false);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchPageSectionData("testimonials");
        setTestimonials(data.testimonials);
      } catch (error) {
        console.error("Error fetching testimonials data:", error);
      }
    };
    loadTestimonials();
  }, []);

  // Call onReady once after testimonials are loaded
  useEffect(() => {
    if (testimonials && !hasCalledReady) {
      onReady?.();
      setHasCalledReady(true);
    }
  }, [testimonials, onReady, hasCalledReady]);

  if (!testimonials) return null;

  const renderStars = (rating: number) =>
    Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          size={16}
          fill={index < rating ? "#D4AF37" : "none"}
          stroke={index < rating ? "#D4AF37" : "#D4AF37"}
          className={`${index < rating ? "text-gold" : "text-gold/40"}`}
        />
      ));

  return (
    <>
      {/* Compact SM/MD layout */}
      <section className="block lg:hidden w-full py-6 bg-gradient-to-b from-white to-secondary/10">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            What Does Our Clients Say
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
            Discover why our clients trust us with their most important
            occasions
          </p>
        </div>

        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial, idx) => (
              <CarouselItem
                key={idx}
                className="pl-2 md:pl-4 flex justify-center"
              >
                {/* SM: Elegant card with bigger image */}
                <div className="flex md:hidden w-[90vw] max-w-[420px] bg-white shadow-md border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden items-center p-4 gap-4">
                  <div className="flex items-center justify-center">
                    <div className="w-[108px] h-[108px] rounded-xl bg-white shadow-inner border border-gray-200 overflow-hidden">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <div>
                      <h3 className="text-sm font-semibold mb-1 text-left leading-tight tracking-tight">
                        {testimonial.name}
                      </h3>
                      <p className="text-xs text-left text-neutral-charcoal/60 mb-2">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <blockquote
                      className="text-xs italic text-neutral-charcoal/90 text-left leading-snug line-clamp-3"
                      title={testimonial.quote}
                    >
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                </div>

                {/* MD and above: original layout */}
                <div className="hidden md:flex relative w-[90vw] max-w-[600px] items-start">
                  <div className="w-[24vh] h-[24vh] rounded-xl overflow-hidden shadow-md z-10">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="-ml-[100px] mt-[60px] bg-white shadow-xl border border-gray-100 dark:border-gray-700 rounded-xl p-4 w-full max-w-[360px] h-[240px] flex flex-col justify-between z-0">
                    <h3 className="text-sm font-semibold text-center">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs text-center text-neutral-charcoal/70">
                      {testimonial.role}
                    </p>
                    <div className="flex justify-center">
                      {renderStars(testimonial.rating)}
                    </div>
                    <blockquote
                      className="text-xs italic text-neutral-charcoal/90 text-center line-clamp-3"
                      title={testimonial.quote}
                    >
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex justify-center mt-5">
            <CarouselPrevious className="relative static mx-2 bg-white hover:bg-primary hover:text-white" />
            <CarouselNext className="relative static mx-2 bg-white hover:bg-primary hover:text-white" />
          </div>
        </Carousel>
      </section>

      {/* Original LG layout */}
      <section
        id="testimonials"
        className="hidden lg:block w-full py-6 bg-gradient-to-b from-white to-secondary/10"
      >
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              What Does Our Clients Say
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
              Discover why our clients trust us with their most important
              occasions
            </p>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.name} className="pl-2 md:pl-4">
                  <div className="container px-10">
                    <div className="grid grid-cols-12">
                      <div className="col-span-12 lg:col-span-1"></div>
                      <div className="col-span-12 lg:col-span-6 text-center">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="rounded-2xl object-cover mx-auto"
                          style={{ width: "40vh", height: "40vh" }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-12 lg:col-span-5" />
                      <div className="col-span-12 lg:col-span-6 xl:col-span-5">
                        <div className="rounded-2xl bg-white shadow-xl mt-4 lg:-mt-[50%] p-6 md:py-6">
                          <div className="md:px-6">
                            <h3 className="text-3xl font-medium mb-2">
                              {testimonial.name}
                            </h3>
                            <p className="text-neutral-charcoal/70 text-sm">
                              {testimonial.role}
                            </p>
                            <div className="flex mb-4">
                              {renderStars(testimonial.rating)}
                            </div>
                            <blockquote className="text-base italic text-neutral-charcoal/90 mb-6 flex-grow">
                              "{testimonial.quote}"
                            </blockquote>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="relative static mx-2 bg-white hover:bg-primary hover:text-white" />
              <CarouselNext className="relative static mx-2 bg-white hover:bg-primary hover:text-white" />
            </div>
          </Carousel>
        </div>
      </section>
    </>
  );
};

export default TestimonialsSection;
