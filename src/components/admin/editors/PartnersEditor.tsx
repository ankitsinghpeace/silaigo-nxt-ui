"use client";
import React, { useState, useEffect } from "react";
import { ContentPermissions, Partner } from "@/types/interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Pencil } from "lucide-react";
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

interface PartnersEditorProps {
  initialPartners?: Partner[];
  onChange?: (partners: Partner[]) => void;
  contentPermissions: ContentPermissions;
}

const PartnersEditor: React.FC<PartnersEditorProps> = ({
  initialPartners = [],
  onChange,
  contentPermissions,
}) => {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await UpdatePageSectionData(partners, "partners");
      toast({
        title: "Changes saved",
        description: "Partners have been updated successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = () => {
    const newId =
      partners.length > 0 ? Math.max(...partners.map((p) => p.id)) + 1 : 1;

    const newPartner: Partner = {
      id: newId,
      name: "New Partner",
      logo: "",
      isActive: true,
    };

    const updatedPartners = [...partners, newPartner];
    setPartners(updatedPartners);
    setIsEditing(newId);
    setHasChanges(true);
    onChange?.(updatedPartners);
  };

  const handleRemovePartner = (id: number) => {
    const updatedPartners = partners.filter((p) => p.id !== id);
    setPartners(updatedPartners);
    if (isEditing === id) setIsEditing(null);
    setHasChanges(true);
    onChange?.(updatedPartners);
  };

  const handleInputChange = <K extends keyof Partner>(
    id: number,
    field: K,
    value: Partner[K],
  ) => {
    const updatedPartners = partners.map((p) =>
      p.id === id ? { ...p, [field]: value } : p,
    );
    setPartners(updatedPartners);
    setHasChanges(true);
    onChange?.(updatedPartners);
  };

  const currentEditingPartner =
    isEditing !== null ? partners.find((p) => p.id === isEditing) : null;

  const handleImageSelect = (url: string) => {
    if (isEditing !== null) {
      handleInputChange(isEditing, "logo", url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Partners</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handleAddPartner}
            variant="outline"
            size="sm"
            disabled={!contentPermissions.create}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Partner
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

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {partners.map((partner) => (
          <Card
            key={partner.id}
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
              isEditing === partner.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="relative aspect-square">
              <ImagePreview
                src={
                  partner.logo ||
                  "https://placehold.co/600x600/EFEFEF/AAAAAA?text=No+Logo"
                }
                alt={partner.name}
                className="w-full h-full object-contain p-4"
                showRemoveButton={false}
              />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium truncate text-base">
                      {partner.name}
                    </h3>
                    <Switch
                      checked={partner.isActive}
                      onCheckedChange={(val) =>
                        handleInputChange(partner.id, "isActive", val)
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between space-y-1">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(partner.id)}
                      className="h-8 w-8"
                      disabled={!contentPermissions.edit}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePartner(partner.id)}
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

        {partners.length === 0 && (
          <div className="text-center p-6 border border-dashed rounded-lg col-span-full">
            <p className="text-muted-foreground">
              No partners yet. Add one to get started.
            </p>
            <Button
              onClick={handleAddPartner}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!contentPermissions.create}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Partner
            </Button>
          </div>
        )}
      </div>

      {/*  Modal for Editing  */}
      {currentEditingPartner && (
        <Dialog
          open={isEditing !== null}
          onOpenChange={(open) => !open && setIsEditing(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={currentEditingPartner.name}
                  onChange={(e) =>
                    handleInputChange(isEditing!, "name", e.target.value)
                  }
                  placeholder="Partner name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Logo</label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setImagePickerOpen(true);
                  }}
                >
                  Choose Logo
                </Button>
                {currentEditingPartner.logo && (
                  <ImagePreview
                    src={currentEditingPartner.logo}
                    className="h-40 rounded-md"
                  />
                )}
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
          resourceName: "partners",
          resourceId: isEditing !== null ? currentEditingPartner.id : 0,
        }}
      />
    </div>
  );
};

export default PartnersEditor;
