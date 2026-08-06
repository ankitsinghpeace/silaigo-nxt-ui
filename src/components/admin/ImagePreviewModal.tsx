import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ImagePreviewModalProps {
  imageUrl: string;
  altText?: string;
  triggerClassName?: string;
  iconClassName?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  altText = "Image preview",
  triggerClassName = "",
  iconClassName = "h-4 w-4",
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={`absolute top-2 right-2 h-7 w-7 p-1 opacity-0 group-hover:opacity-100 transition-opacity ${triggerClassName}`}
        >
          <Eye className={iconClassName} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-auto p-1 bg-background/80 backdrop-blur-xl">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[80vh] object-contain rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewModal;
