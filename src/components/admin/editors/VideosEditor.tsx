"use client";
import React, { useEffect, useState } from "react";
import { ContentPermissions, VideoCard } from "@/types/interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImagePreviewModal from "@/components/admin/ImagePreviewModal";
import { UpdatePageSectionData } from "@/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ImagePickerModal from "@/components/admin/modals/image.picker.modal";
import ImagePreview from "../ImagePreview";

interface VideosEditorProps {
  videos: VideoCard[];
  showSaveButton?: boolean;
  onChange?: (videos: VideoCard[]) => void;
  contentPermissions: ContentPermissions;
}

const VideosEditor: React.FC<VideosEditorProps> = ({
  videos: initialVideos,
  showSaveButton = true,
  onChange,
  contentPermissions,
}) => {
  const [videos, setVideos] = useState<VideoCard[]>(initialVideos);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasChanges(JSON.stringify(videos) !== JSON.stringify(initialVideos));
  }, [videos, initialVideos]);

  const handleSaveChanges = async () => {
    try {
      await UpdatePageSectionData(videos, "videos");
      toast({
        title: "Changes saved",
        description: "Videos have been updated successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddVideo = () => {
    const newId =
      videos.length > 0 ? Math.max(...videos.map((v) => v.id)) + 1 : 1;

    const newVideo: VideoCard = {
      id: newId,
      title: "New Video",
      thumbnail: "",
      videoUrl: "",
      description: "Video description goes here",
      isActive: true,
    };

    const updatedVideos = [...videos, newVideo];
    setVideos(updatedVideos);
    setEditingId(newId);
    if (onChange) onChange(updatedVideos);
  };

  const handleRemoveVideo = (id: number) => {
    const updatedVideos = videos.filter((v) => v.id !== id);
    setVideos(updatedVideos);
    if (editingId === id) setEditingId(null);
    if (onChange) onChange(updatedVideos);
  };

  const handleUpdateVideo = (
    id: number,
    field: keyof VideoCard,
    value: string | boolean,
  ) => {
    const updatedVideos = videos.map((v) => {
      if (v.id === id) {
        let updated = { ...v, [field]: value };

        if (field === "videoUrl") {
          let videoId = value as string;
          if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
            const urlObject = new URL(videoId);
            if (videoId.includes("youtube.com")) {
              videoId = urlObject.searchParams.get("v") || videoId;
            } else if (videoId.includes("youtu.be")) {
              videoId = urlObject.pathname.substring(1) || videoId;
            }
          }
          updated.videoUrl = videoId;
        }

        return updated;
      }
      return v;
    });

    setVideos(updatedVideos);
    if (onChange) onChange(updatedVideos);
  };

  const handleToggleActive = (id: number) => {
    const updatedVideos = videos.map((v) =>
      v.id === id ? { ...v, isActive: !v.isActive } : v,
    );
    setVideos(updatedVideos);
    if (onChange) onChange(updatedVideos);
  };

  const handleImageSelect = (url: string) => {
    if (editingId !== null) {
      handleUpdateVideo(editingId, "thumbnail", url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Videos</h2>
        {showSaveButton && (
          <div className="flex space-x-2">
            <Button
              onClick={handleAddVideo}
              variant="outline"
              size="sm"
              disabled={!contentPermissions.create}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
            <Button
              onClick={handleSaveChanges}
              variant="default"
              size="sm"
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card
            key={video.id}
            className={editingId === video.id ? "ring-2 ring-primary" : ""}
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={
                  video.thumbnail ||
                  "https://placehold.co/600x400/EFEFEF/AAAAAA?text=No+Thumbnail"
                }
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {video.thumbnail && (
                <ImagePreviewModal
                  imageUrl={video.thumbnail}
                  altText={video.title}
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-primary ml-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium">{video.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-4">
                {video.description}
              </p>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditingId(editingId === video.id ? null : video.id)
                  }
                  disabled={!contentPermissions.edit}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {editingId === video.id ? "Close" : "Edit"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveVideo(video.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={!contentPermissions.delete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>

              {editingId === video.id && (
                <div className="mt-4 space-y-3 pt-3 border-t">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={video.title}
                      onChange={(e) =>
                        handleUpdateVideo(video.id, "title", e.target.value)
                      }
                      placeholder="Video title"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Thumbnail URL</label>
                    <Input
                      value={video.thumbnail}
                      onChange={(e) =>
                        handleUpdateVideo(
                          editingId,
                          "thumbnail",
                          e.target.value,
                        )
                      }
                      placeholder="Thumbnail URL"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Video URL</label>
                    <Input
                      value={video.videoUrl}
                      onChange={(e) =>
                        handleUpdateVideo(editingId, "videoUrl", e.target.value)
                      }
                      placeholder="YouTube URL or Video ID"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter full YouTube URL or just the video ID
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={video.description}
                      onChange={(e) =>
                        handleUpdateVideo(
                          editingId,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder="Video description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Active Status</label>
                    <Button
                      variant={video.isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleActive(video.id)}
                    >
                      {video.isActive ? "Active" : "Inactive"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {videos.length === 0 && (
          <div className="text-center p-6 border border-dashed rounded-lg col-span-3">
            <p className="text-muted-foreground">
              No videos yet. Add one to get started.
            </p>
            <Button
              onClick={handleAddVideo}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!contentPermissions.create}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
        )}
      </div>

      {/* Modal for Editing */}
      {/* {editingId !== null && (
        <Dialog
          open={editingId !== null}
          onOpenChange={(open) => !open && setEditingId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                    value={videos[editingId] ? videos[editingId].title : ""}
                  onChange={(e) =>
                    handleUpdateVideo(editingId, "title", e.target.value)
                  }
                  placeholder="Video title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={videos[editingId] ? videos[editingId].description : ""}
                  onChange={(e) =>
                    handleUpdateVideo(editingId, "description", e.target.value)
                  }
                  placeholder="Video description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail</label>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setImagePickerOpen(true);
                  }}
                >
                  Choose Thumbnail
                </Button>
                {videos[editingId] && videos[editingId].thumbnail && (
                <ImagePreview
                src={videos[editingId]?.thumbnail}
                className="h-40 rounded-md"
              />
                )}
                
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Video URL</label>
                <Input
                  value={videos[editingId] ? videos[editingId].videoUrl : ""}
                  onChange={(e) =>
                    handleUpdateVideo(editingId, "videoUrl", e.target.value)
                  }
                  placeholder="Video URL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button onClick={() => setEditingId(null)} disabled={!contentPermissions.edit || !contentPermissions.create}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )} */}

      <ImagePickerModal
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onImageSelect={handleImageSelect}
        imageInfo={{
          resourceName: "videos",
          resourceId: editingId !== null ? editingId : 0,
        }}
      />
    </div>
  );
};

export default VideosEditor;
