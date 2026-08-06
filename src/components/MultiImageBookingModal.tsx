"use client";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { uploadToS3 } from "@/lib/uploadFile";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";

const generatePreviewUrl = async (imageFiles) => {
  const imageUrls = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const reader = new FileReader();
    const loadFile = new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(imageFiles[i]);
    });

    const result = await loadFile;
    imageUrls.push(result);
  }

  return imageUrls;
};

type tabs = "upload" | "preview";
interface MultiImageBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onImageSelect: (urls: string[]) => void;
  alreadySelectedImages: string[];
  onRemoveImage?: (url: string) => void;
  type?: string;
  isPreviewMode: boolean;
}

const MultiImageBookingModal = ({
  open,
  onOpenChange,
  onClose,
  onImageSelect,
  alreadySelectedImages,
  onRemoveImage,
  type,
  isPreviewMode,
}: MultiImageBookingModalProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<tabs>(
    alreadySelectedImages.length > 0 ? "preview" : "upload",
  );
  const imageFiles = useRef<File[]>([]);
  const { toast } = useToast();

  const removeImage = (index: number) => {
    const filteredImages = images.filter((_, i) => {
      return i != index;
    });
    setImages(filteredImages);

    const filteredFiles = imageFiles.current.filter((_, i) => {
      return i != index;
    });

    imageFiles.current = filteredFiles;
  };

  const removeAlreadyUploadedImages = (url: string) => {
    const filteredImages = alreadySelectedImages.filter((imgUrl) => {
      return imgUrl != url;
    });
    onRemoveImage(url);
  };

  const handleSubmit = async () => {
    if (!imageFiles.current && imageFiles.current.length === 0) {
      return;
    }

    const uploadPromises = imageFiles.current.map((file) => {
      const fileInfo = {
        resourceName: file.name,
        resourceId: type,
        fileType: file.type,
        fileSize: file.size,
      };

      return uploadToS3(fileInfo, file);
    });

    setIsSubmitting(true);
    try {
      const results = await Promise.all(uploadPromises);
      onImageSelect(results);
      setImages([]);
      imageFiles.current = [];
      toast({
        title: "Success",
        description: "Images Uploaded successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    imageFiles.current = acceptedFiles;
    const imageUrls = await generatePreviewUrl(acceptedFiles);
    setImages(imageUrls);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: { "image/*;capture=camera": [] },
    onDrop,
  });

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${
        !open ? "hidden" : ""
      }`}
    >
      <div className="bg-white p-6 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Your Samples
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add multiple images for your order
            </p>
          </div>
          <div className="flex gap-4 items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-300 ease-in-out"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as tabs)}
          className="w-full mb-4"
        >
          <TabsList className="border-b border-gray-200 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="upload"
              className="px-4 py-2 text-base font-semibold text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
            >
              Upload Images
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="px-4 py-2 text-base font-semibold text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
            >
              Uploaded Images
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="space-y-6 mt-4 pb-20">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 z-50 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  {...getRootProps()}
                  className={`p-4  text-center rounded-md cursor-pointer hover:bg-primary/5  border-2 border-dashed border-gray-300 ${
                    isDragActive ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    "Drop the image here..."
                  ) : (
                    <div className="aspect-square  rounded-lg  transition-colors flex flex-col items-center justify-center gap-2">
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Drag drop here or click here to select
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative bottom-0 left-0 right-0 flex gap-3 p-4 border-t bg-white z-50">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleSubmit}
                  disabled={images.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4  animate-spin" />
                  ) : (
                    `Submit ${images.length} Image${
                      images.length !== 1 ? "s" : ""
                    }`
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-6 mt-4 pb-20">
              <h4 className="mt-4">Uploaded images</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {alreadySelectedImages.map((url, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeAlreadyUploadedImages(url)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MultiImageBookingModal;
