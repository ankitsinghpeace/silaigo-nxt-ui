"use client";
import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useDropzone } from "react-dropzone";
import { uploadToS3 } from "../../../lib/uploadFile";
import { useToast } from "@/hooks/use-toast";
import ImagePreview from "../ImagePreview";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (url: string) => void;
  imageInfo: {
    resourceName: string;
    resourceId: number;
    subResourceName?: string;
    subResourceId?: number;
  };
}

const ImagePickerModal: React.FC<Props> = ({
  open,
  onOpenChange,
  onImageSelect,
  imageInfo,
}) => {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      const fileInfo = {
        resourceName: imageInfo.resourceName,
        resourceId: imageInfo.resourceId,
        subResourceName: imageInfo.subResourceName,
        subResourceId: imageInfo.subResourceId,
        fileType: file.type,
        fileSize: file.size,
      };
      const url = await uploadToS3(fileInfo, file);
      onImageSelect(url);
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      onImageSelect("");
    } finally {
      setIsUploading(false);
      onOpenChange(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setUrlInput(""); // clear URL if file is selected
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { "image/*": [] },
    onDrop,
  });

  const handleSubmitURL = () => {
    if (urlInput) {
      onImageSelect(urlInput);
      onOpenChange(false);
      setUrlInput("");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUrlInput("");
    setSelectedFile(null);
    setMode("upload");
  };

  const handleDone = () => {
    if (mode === "url" && urlInput) {
      handleSubmitURL();
    }
    if (mode === "upload" && selectedFile) {
      uploadFile(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Image</DialogTitle>
        </DialogHeader>

        {(selectedFile || urlInput) && (
          <ImagePreview
            src={selectedFile ? URL.createObjectURL(selectedFile) : urlInput}
            className="h-40 rounded-md"
          />
        )}

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "upload" | "url")}
          className="w-full mb-4"
        >
          <TabsList className="border-b border-gray-200 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="upload"
              className="px-4 py-2 text-base font-semibold text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
            >
              Upload File
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="px-4 py-2 text-base font-semibold text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
            >
              Paste URL
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "upload" && (
          <div
            {...getRootProps()}
            className={`p-4 border border-dashed text-center rounded-md cursor-pointer ${
              isDragActive ? "border-primary bg-primary/10" : ""
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive
              ? "Drop the image here..."
              : "Drag & drop or click to upload"}
          </div>
        )}

        {mode === "url" && (
          <div className="space-y-2">
            <Input
              placeholder="Paste image URL"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (selectedFile) setSelectedFile(null);
              }}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleDone} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePickerModal;
