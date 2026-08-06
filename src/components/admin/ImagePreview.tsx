import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImagePreviewModal from "./ImagePreviewModal";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  showRemoveButton?: boolean;
  imgClassName?: string;
  onRemove?: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "Image preview",
  className = "",
  imgClassName = "",
  showRemoveButton = true,
  onRemove,
}) => {
  return (
    <div
      className={`relative ${className} overflow-hidden group cursor-pointer`}
    >
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${imgClassName}`}
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/600x400/EFEFEF/AAAAAA?text=No+Image";
        }}
      />

      {showRemoveButton && onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 left-2 h-7 w-7 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <ImagePreviewModal imageUrl={src} altText={alt} />
    </div>
  );
};

export default ImagePreview;
