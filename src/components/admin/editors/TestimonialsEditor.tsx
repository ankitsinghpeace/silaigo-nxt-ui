"use client";
import React, { useState } from "react";
import { ContentPermissions, Testimonial } from "@/types/interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Pencil, Star } from "lucide-react";
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
import { ensureTestimonialsFormat } from "@/services/dataFormatters";
import ImagePickerModal from "@/components/admin/modals/image.picker.modal";
import { generateErrorMessage } from "@/lib/helpers";

interface TestimonialsEditorProps {
  initialTestimonials?: Testimonial[];
  onChange?: (testimonials: Testimonial[]) => void;
  contentPermissions: ContentPermissions;
}

const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({
  initialTestimonials = [],
  onChange,
  contentPermissions,
}) => {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(initialTestimonials);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const formattedTestimonials = ensureTestimonialsFormat(testimonials);
      await UpdatePageSectionData(formattedTestimonials, "testimonials");
      toast({
        title: "Changes saved",
        description: "Testimonials have been updated successfully.",
      });
      setHasChanges(false);
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

  const handleAddTestimonial = () => {
    const newId =
      testimonials.length > 0
        ? Math.max(...testimonials.map((t) => t.id)) + 1
        : 1;

    const newTestimonial: Testimonial = {
      id: newId,
      name: "New Client",
      role: "Client Role",
      avatar: "",
      quote: "Add a testimonial quote here.",
      rating: 5,
      isActive: true,
    };

    const updatedTestimonials = [...testimonials, newTestimonial];
    setTestimonials(updatedTestimonials);
    setIsEditing(newId);
    setHasChanges(true);
    onChange?.(updatedTestimonials);
  };

  const handleRemoveTestimonial = (id: number) => {
    const updatedTestimonials = testimonials.filter((t) => t.id !== id);
    setTestimonials(updatedTestimonials);
    if (isEditing === id) setIsEditing(null);
    setHasChanges(true);
    onChange?.(updatedTestimonials);
  };

  const handleInputChange = <K extends keyof Testimonial>(
    id: number,
    field: K,
    value: Testimonial[K],
  ) => {
    const updatedTestimonials = testimonials.map((t) =>
      t.id === id ? { ...t, [field]: value } : t,
    );
    setTestimonials(updatedTestimonials);
    setHasChanges(true);
    onChange?.(updatedTestimonials);
  };

  const currentEditingTestimonial =
    isEditing !== null ? testimonials.find((t) => t.id === isEditing) : null;

  const handleImageSelect = (url: string) => {
    if (isEditing !== null) {
      handleInputChange(isEditing, "avatar", url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Testimonials</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handleAddTestimonial}
            variant="outline"
            size="sm"
            disabled={!contentPermissions.create}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Testimonial
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="default"
            size="sm"
            disabled={!hasChanges || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
              isEditing === testimonial.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="relative aspect-square">
              <ImagePreview
                src={
                  testimonial.avatar ||
                  "https://placehold.co/600x600/EFEFEF/AAAAAA?text=No+Image"
                }
                alt={testimonial.name}
                className="w-full h-full object-cover"
                showRemoveButton={false}
              />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium truncate text-base">
                      {testimonial.name}
                    </h3>
                    <Switch
                      checked={testimonial.isActive}
                      onCheckedChange={(val) =>
                        handleInputChange(testimonial.id, "isActive", val)
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {testimonial.role}
                  </p>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between space-y-1">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(testimonial.id)}
                      className="h-8 w-8"
                      disabled={!contentPermissions.edit}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTestimonial(testimonial.id)}
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

        {testimonials.length === 0 && (
          <div className="text-center p-6 border border-dashed rounded-lg col-span-full">
            <p className="text-muted-foreground">
              No testimonials yet. Add one to get started.
            </p>
            <Button
              onClick={handleAddTestimonial}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!contentPermissions.create}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Testimonial
            </Button>
          </div>
        )}
      </div>

      {/*  Modal for Editing  */}
      {currentEditingTestimonial && (
        <Dialog
          open={isEditing !== null}
          onOpenChange={(open) => !open && setIsEditing(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={currentEditingTestimonial.name}
                  onChange={(e) =>
                    handleInputChange(isEditing!, "name", e.target.value)
                  }
                  placeholder="Client name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input
                  value={currentEditingTestimonial.role}
                  onChange={(e) =>
                    handleInputChange(isEditing!, "role", e.target.value)
                  }
                  placeholder="Client role or title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Avatar</label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setImagePickerOpen(true);
                  }}
                >
                  Choose Avatar
                </Button>
                {currentEditingTestimonial.avatar && (
                  <ImagePreview
                    src={currentEditingTestimonial.avatar}
                    className="h-40 rounded-md"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quote</label>
                <Textarea
                  value={currentEditingTestimonial.quote}
                  onChange={(e) =>
                    handleInputChange(isEditing!, "quote", e.target.value)
                  }
                  placeholder="Testimonial quote"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={currentEditingTestimonial.rating}
                  onChange={(e) =>
                    handleInputChange(
                      isEditing!,
                      "rating",
                      parseFloat(e.target.value),
                    )
                  }
                  placeholder="Rating (1-5)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditing(null)}
                disabled={
                  isLoading ||
                  !contentPermissions.edit ||
                  !contentPermissions.create
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
          resourceName: "testimonials",
          resourceId: currentEditingTestimonial?.id || 0,
        }}
      />
    </div>
  );
};

export default TestimonialsEditor;
