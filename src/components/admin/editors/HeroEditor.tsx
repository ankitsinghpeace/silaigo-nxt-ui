"use client";
import React, { useEffect, useRef, useState } from "react";
import { ContentPermissions, HeroSlide } from "@/types/interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Save,
  ChevronUp,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ImagePreview from "@/components/admin/ImagePreview";
import { UpdatePageSectionData } from "@/services";
import ImagePickerModal from "@/components/admin/modals/image.picker.modal";
import { generateErrorMessage } from "@/lib/helpers";

interface HeroEditorProps {
  hero: HeroSlide[];
  onChange?: (hero: HeroSlide[]) => void;
  contentPermissions: ContentPermissions;
}

const HeroEditor: React.FC<HeroEditorProps> = ({
  hero: initialSlides,
  onChange,
  contentPermissions,
}) => {
  const [hero, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imageEditOpen, setImageEditOpen] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState<
    "lgImage" | "mdImage" | "smImage"
  >("lgImage");

  const { toast } = useToast();

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await UpdatePageSectionData(hero, "hero");
      toast({
        title: "Changes saved",
        description: "Your hero slides have been updated successfully.",
      });
      setIsEditing(null);
    } catch (error) {
      const err = generateErrorMessage(error);
      toast({
        title: "Error",
        description: err,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newId = hero.length > 0 ? Math.max(...hero.map((s) => s.id)) + 1 : 1;
    const newSlide: HeroSlide = {
      id: newId,
      isActive: true,
      mdImage: "",
      lgImage: "",
      smImage: "",
      link: "",
      title: "New Slide Title",
      subtitle: "New Slide Subtitle",
    };
    const updatedSlides = [...hero, newSlide];
    setSlides(updatedSlides);
    setIsEditing(updatedSlides.length - 1);
    onChange?.(updatedSlides);
  };

  const handleRemoveSlide = (index: number) => {
    const updatedSlides = hero.filter((_, i) => i !== index);
    setSlides(updatedSlides);
    if (isEditing === index) setIsEditing(null);
    onChange?.(updatedSlides);
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= hero.length) return;
    const updatedSlides = [...hero];
    [updatedSlides[index], updatedSlides[newIndex]] = [
      updatedSlides[newIndex],
      updatedSlides[index],
    ];
    setSlides(updatedSlides);
    onChange?.(updatedSlides);
  };

  const handleInputChange = <K extends keyof HeroSlide>(
    index: number,
    field: K,
    value: HeroSlide[K],
  ) => {
    const updatedSlides = [...hero];
    updatedSlides[index][field] = value;
    setSlides(updatedSlides);
    onChange?.(updatedSlides);
  };

  const currentEditingSlide = isEditing !== null ? hero[isEditing] : null;

  const handleImageSelect = (url: string) => {
    if (isEditing !== null && url && selectedImageType) {
      handleInputChange(isEditing, selectedImageType, url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hero Slides</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handleAddSlide}
            variant="outline"
            size="sm"
            disabled={!contentPermissions.create}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Slide
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="default"
            size="sm"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hero.map((slide, index) => (
          <Card
            key={index}
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
              isEditing === index ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="relative aspect-video">
              <ImagePreview
                src={
                  slide.lgImage ||
                  "https://placehold.co/600x400/EFEFEF/AAAAAA?text=No+Image"
                }
                alt={slide.title || `Slide ${index + 1}`}
                className="w-full h-full"
                showRemoveButton={false}
              />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium truncate text-base">
                      {slide.title}
                    </h3>
                    <Switch
                      checked={slide.isActive}
                      onCheckedChange={(val) =>
                        handleInputChange(index, "isActive", val)
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {slide.subtitle}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between space-y-1">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveSlide(index, "up")}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveSlide(index, "down")}
                      disabled={index === hero.length - 1}
                      className="h-8 w-8"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsEditing(index);
                        setImageEditOpen(false);
                      }}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSlide(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={!contentPermissions.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {hero.length === 0 && (
          <div className="text-center p-6 border border-dashed rounded-lg col-span-full">
            <p className="text-muted-foreground">
              No hero yet. Add one to get started.
            </p>
            <Button
              onClick={handleAddSlide}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!contentPermissions.create}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Slide
            </Button>
          </div>
        )}
      </div>

      {/* === Modal for Editing === */}
      {currentEditingSlide && (
        <Dialog
          open={isEditing !== null}
          onOpenChange={(open) => !open && setIsEditing(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Slide</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={currentEditingSlide.title}
                onChange={(e) =>
                  handleInputChange(isEditing!, "title", e.target.value)
                }
                placeholder="Title"
              />
              <Textarea
                value={currentEditingSlide.subtitle}
                onChange={(e) =>
                  handleInputChange(isEditing!, "subtitle", e.target.value)
                }
                placeholder="Subtitle"
              />
              <Input
                value={currentEditingSlide.link}
                onChange={(e) =>
                  handleInputChange(isEditing!, "link", e.target.value)
                }
                placeholder="Redirect Link"
              />

              <Button
                onClick={() => setImageEditOpen((prev) => !prev)}
                variant="outline"
              >
                {imageEditOpen ? "Hide" : "Preview & Edit"} Images
              </Button>

              {imageEditOpen && (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    {(["lgImage", "mdImage", "smImage"] as const).map(
                      (type) => (
                        <Button
                          key={type}
                          variant={
                            selectedImageType === type ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedImageType(type)}
                        >
                          {type === "lgImage"
                            ? "Large"
                            : type === "mdImage"
                              ? "Medium"
                              : "Small"}
                        </Button>
                      ),
                    )}
                  </div>

                  {selectedImageType && (
                    <div className="space-y-2">
                      <Button
                        variant="secondary"
                        onClick={() => setImagePickerOpen(true)}
                        className="w-full"
                      >
                        Choose Image
                      </Button>
                      {currentEditingSlide[selectedImageType] && (
                        <ImagePreview
                          src={currentEditingSlide[selectedImageType]}
                          alt="Preview"
                          className="h-40 rounded-md"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditing(null)}
                disabled={
                  !contentPermissions.edit || !contentPermissions.create
                }
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ImagePickerModal
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onImageSelect={handleImageSelect}
        imageInfo={{
          resourceName: "hero",
          resourceId: isEditing !== null ? hero[isEditing].id : 0,
        }}
      />
    </div>
  );
};

export default HeroEditor;
