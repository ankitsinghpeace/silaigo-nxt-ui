"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { uploadToS3 } from "@/lib/uploadFile";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabMode = "upload" | "preview";

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

const generatePreviewUrl = async (imageFiles: File[]): Promise<string[]> => {
  return Promise.all(
    imageFiles.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("Failed to generate image preview"));
            }
          };

          reader.onerror = () =>
            reject(reader.error || new Error("Failed to read image"));

          reader.readAsDataURL(file);
        }),
    ),
  );
};

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

  const [mode, setMode] = useState<TabMode>(
    alreadySelectedImages.length > 0 && isPreviewMode ? "preview" : "upload",
  );

  const imageFiles = useRef<File[]>([]);
  const { toast } = useToast();

  const handleClose = () => {
    if (isSubmitting) return;

    setImages([]);
    imageFiles.current = [];

    onOpenChange(false);
    onClose();
  };

  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );

    imageFiles.current = imageFiles.current.filter(
      (_, currentIndex) => currentIndex !== index,
    );
  };

  const removeAlreadyUploadedImage = (url: string) => {
    onRemoveImage?.(url);
  };

  const handleSubmit = async () => {
    if (imageFiles.current.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadPromises = imageFiles.current.map((file) => {
        const fileInfo = {
          resourceName: file.name,
          resourceId: type,
          fileType: file.type,
          fileSize: file.size,
        };

        return uploadToS3(fileInfo, file);
      });

      const results = await Promise.all(uploadPromises);

      onImageSelect(results);

      setImages([]);
      imageFiles.current = [];

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });

      handleClose();
    } catch (error) {
      console.error("Error uploading images:", error);

      toast({
        title: "Upload failed",
        description: "Unable to upload your images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) {
      return;
    }

    imageFiles.current = [...imageFiles.current, ...acceptedFiles];

    try {
      const previews = await generatePreviewUrl(imageFiles.current);

      setImages(previews);
    } catch (error) {
      console.error("Error generating image previews:", error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      "image/*": [],
    },
    onDrop,
  });

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-upload-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              id="image-upload-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              Upload Your Samples
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add multiple images for your order
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 transition-colors duration-300 ease-in-out hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close upload modal"
          >
            <X size={24} />
          </button>
        </div>

        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as TabMode)}
          className="mb-4 w-full"
        >
          <TabsList className="h-auto border-b border-gray-200 bg-transparent p-0">
            <TabsTrigger
              value="upload"
              className="rounded-none bg-transparent px-4 py-2 text-base font-semibold text-gray-600 shadow-none focus-visible:outline-none focus-visible:ring-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Upload Images
            </TabsTrigger>

            <TabsTrigger
              value="preview"
              className="rounded-none bg-transparent px-4 py-2 text-base font-semibold text-gray-600 shadow-none focus-visible:outline-none focus-visible:ring-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Uploaded Images
            </TabsTrigger>
          </TabsList>

          {/* Upload */}
          <TabsContent value="upload">
            <div className="mt-4 space-y-6 pb-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((url, index) => (
                  <div
                    key={`preview-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={url}
                      alt={`Selected upload ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Dropzone */}
                <div
                  {...getRootProps()}
                  className={`cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:bg-primary/5 ${
                    isDragActive ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <input {...getInputProps()} />

                  <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg">
                    {isDragActive ? (
                      <span className="text-sm font-medium text-primary">
                        Drop the images here...
                      </span>
                    ) : (
                      <>
                        <Plus className="h-8 w-8 text-gray-400" />

                        <span className="text-xs text-gray-500">
                          Drag & drop or click to select
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t bg-white p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleSubmit}
                  disabled={images.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    `Submit ${images.length} Image${
                      images.length !== 1 ? "s" : ""
                    }`
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Already Uploaded */}
          <TabsContent value="preview">
            <div className="mt-4 space-y-6 pb-4">
              <h4 className="font-medium text-gray-900">Uploaded images</h4>

              {alreadySelectedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {alreadySelectedImages.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      <img
                        src={url}
                        alt={`Uploaded image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => removeAlreadyUploadedImage(url)}
                          className="rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                          aria-label={`Remove uploaded image ${index + 1}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-gray-500">
                  No images uploaded yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MultiImageBookingModal;
