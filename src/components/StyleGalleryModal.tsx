"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";

interface StyleImage {
  id: string;
  url: string;
  alt: string;
}

interface StyleGalleryModalProps {
  images: StyleImage[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

const StyleGalleryModal: React.FC<StyleGalleryModalProps> = ({
  images,
  initialIndex,
  open,
  onOpenChange,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Reset loading state when the current image changes
  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [currentIndex, open]);

  const handlePrevious = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    // Reset animating state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

    // Reset animating state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, currentIndex, isAnimating]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 backdrop-blur-xl overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
          onClick={() => onOpenChange(false)}
        >
          <X size={20} />
        </Button>

        {/* Title */}
        <div className="absolute top-4 left-4 z-50 text-white">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-white/70">
            {currentIndex + 1} of {images.length}
          </p>
        </div>

        {/* Main image */}
        <div className="relative h-[85vh] w-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].alt}
            className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsLoading(false)}
          />

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
            onClick={handlePrevious}
          >
            <ChevronLeft size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
            onClick={handleNext}
          >
            <ChevronRight size={24} />
          </Button>
        </div>

        {/* Thumbnails */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white text-sm truncate">
                {images[currentIndex].alt}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full"
              >
                <Download size={18} className="mr-1" />
                Save
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full"
              >
                <Share2 size={18} className="mr-1" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex justify-center mt-2 overflow-x-auto py-2 gap-2 scrollbar-none">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`h-16 w-24 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all duration-200 ${
                  currentIndex === index
                    ? "ring-2 ring-primary scale-105"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StyleGalleryModal;
