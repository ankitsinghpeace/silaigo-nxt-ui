"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, Pencil, Trash2, X, Image, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImagePreview from "@/components/admin/ImagePreview";
import ImagePickerModal from "@/components/admin/modals/image.picker.modal";
import { toast } from "@/components/ui/use-toast";
import {
  ContentPermissions,
  Customization,
  CustomizationItem,
} from "@/types/interface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  addCustomizationOptionsData,
  removeCustomizationOptionsData,
  updateCustomizationOptionsData,
  updateCustomizationRank,
} from "@/services/modules/category.api";
import { generateErrorMessage } from "@/lib/helpers";

export enum Action {
  NONE = "NONE",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

type inventoryPermissions = ContentPermissions;

interface CustomizationsEditorProps {
  customizations: Customization[];
  onChange: (customizations: Customization[]) => void;
  inventoryPermission: inventoryPermissions;
}

const CustomizationsEditor: React.FC<CustomizationsEditorProps> = ({
  customizations,
  onChange,
  inventoryPermission,
}) => {
  const types = customizations.map((item) => item.type);
  const [selectedType, setSelectedType] = useState<string | null>(
    types[0] ?? null,
  );
  const [selectedCustomization, setSelectedCustomization] =
    useState<Customization | null>(null);
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const [originalOption, setOriginalOption] = useState<any>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<CustomizationItem | null>(
    null,
  );
  const [isNewOption, setIsNewOption] = useState(false);
  const [pendingAdditions, setPendingAdditions] = useState<CustomizationItem[]>(
    [],
  );
  const [pendingRemovals, setPendingRemovals] = useState<CustomizationItem[]>(
    [],
  );
  const [rank, setRank] = useState<number>(0);

  const getOptionId = (option: any) => option._id ?? option.id ?? option.tempId;

  useEffect(() => {
    if (selectedType) {
      const customization = customizations.find((c) => c.type === selectedType);
      setSelectedCustomization(customization ?? null);
      setRank(customization?.rank ?? 0);
      console.log(customization);
    } else {
      setSelectedCustomization(null);
    }
    setCurrentEditingId(null);
    setOriginalOption(null);
  }, [selectedType, customizations]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  const handleAddOption = () => {
    if (!selectedCustomization) return;
    const newOption: CustomizationItem = {
      id: -Date.now(),
      title: "",
      complexity: "Basic",
      imageUrl: "",
      price: 0,
      discountedPrice: 0,
    };
    setEditingOption(newOption);
    setIsNewOption(true);
    setOptionModalOpen(true);
  };

  const handleEditOption = (option: any) => {
    setEditingOption({ ...option });
    setIsNewOption(false);
    setOptionModalOpen(true);
  };

  const handleOptionModalSave = async () => {
    if (!selectedCustomization || !editingOption) return;

    try {
      if (isNewOption) {
        setPendingAdditions((prev) => [...prev, editingOption]);
        const updatedOptions = [
          ...selectedCustomization.options,
          editingOption,
        ];
        updateCustomization({
          ...selectedCustomization,
          options: updatedOptions,
        });

        toast({
          title: "Success",
          description: "Option added to pending changes.",
        });
      } else {
        const updatedOptions = selectedCustomization.options.map((opt) =>
          getOptionId(opt) === getOptionId(editingOption) ? editingOption : opt,
        );

        await updateCustomizationOptionsData(
          selectedCustomization.type,
          editingOption,
        );

        updateCustomization({
          ...selectedCustomization,
          options: updatedOptions,
        });
        toast({
          title: "Saved",
          description: "Option updated successfully.",
        });
      }

      setOptionModalOpen(false);
      setEditingOption(null);
      setIsNewOption(false);
    } catch (error) {
      console.error("Error saving option:", error);
      toast({
        title: "Error",
        description: "Failed to save option. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOptionModalCancel = () => {
    setOptionModalOpen(false);
    setEditingOption(null);
    setIsNewOption(false);
  };

  const handleRemoveOption = (option: any) => {
    if (!selectedCustomization) return;
    setPendingRemovals((prev) => [...prev, option]);
    const filtered = selectedCustomization.options.filter(
      (opt) => getOptionId(opt) !== getOptionId(option),
    );
    updateCustomization({
      ...selectedCustomization,
      options: filtered,
    });
  };

  const handleImageSelect = (imageUrl: string) => {
    if (editingOption) {
      setEditingOption({ ...editingOption, imageUrl });
    }
    setImagePickerOpen(false);
  };

  const updateCustomization = (updated: Customization) => {
    const updatedList = customizations.map((c) =>
      c.type === updated.type ? updated : c,
    );
    onChange(updatedList);
    setSelectedCustomization(updated);
  };

  const handleSaveAllChanges = async () => {
    if (!selectedCustomization) return;

    try {
      if (pendingAdditions.length > 0) {
        const response = await addCustomizationOptionsData(
          selectedCustomization.type,
          pendingAdditions,
        );

        updateCustomization({
          ...selectedCustomization,
          options: [...response.options],
        });

        setPendingAdditions([]);
      }

      if (pendingRemovals.length > 0) {
        const optionIds = pendingRemovals.map((opt) => getOptionId(opt));
        await removeCustomizationOptionsData(
          selectedCustomization.type,
          optionIds,
        );
        setPendingRemovals([]);
      }

      toast({
        title: "Success",
        description: "All changes saved successfully.",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRank = async (rank: number) => {
    try {
      await updateCustomizationRank(selectedCustomization?.type, rank);
      toast({
        title: "Success",
        description: "Rank updated successfully.",
      });
    } catch (error) {
      console.error("Error updating rank:", error);
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 border-b border-muted pb-2">
        {customizations.map((customization) => (
          <button
            key={customization.type}
            onClick={() => handleTypeChange(customization.type)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 ${
              customization.type === selectedType
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary hover:border-primary"
            }`}
          >
            {customization.type}
          </button>
        ))}
      </div>

      <div className="flex gap-3 border-b border-muted pb-2 items-center">
        <Label>Rank</Label>
        <Input
          type="text"
          placeholder="Enter rank"
          value={rank}
          onChange={(e) => setRank(Number(e.target.value))}
        />
        <Button
          variant="default"
          size="sm"
          onClick={() => handleUpdateRank(rank)}
        >
          Update Rank
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customizations</h2>
        <div className="flex gap-2">
          {selectedCustomization && (
            <>
              {(pendingAdditions.length > 0 || pendingRemovals.length > 0) && (
                <Button
                  onClick={handleSaveAllChanges}
                  variant="default"
                  size="sm"
                  disabled={
                    !inventoryPermission.edit || !inventoryPermission.create
                  }
                >
                  Save Changes (
                  {pendingAdditions.length + pendingRemovals.length})
                </Button>
              )}
              <Button
                onClick={handleAddOption}
                variant="outline"
                size="sm"
                disabled={!inventoryPermission.create}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </>
          )}
        </div>
      </div>

      {!selectedType ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Customization Selected
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Select a customization type from the tabs above
          </p>
        </div>
      ) : selectedCustomization ? (
        <div className="grid md:grid-cols-3 gap-4">
          {selectedCustomization.options.map((option, i) => {
            const optionId = getOptionId(option);
            return (
              <Card
                key={`${optionId}-${i}`}
                className="relative flex flex-col border border-border"
              >
                <div className="relative w-full aspect-square bg-muted">
                  <ImagePreview
                    src={
                      option.imageUrl ||
                      "https://placehold.co/400x400/EFEFEF/AAAAAA?text=No+Image"
                    }
                    alt={option.title || "Untitled"}
                    className="object-cover w-full h-full"
                    showRemoveButton={false}
                  />
                </div>
                <CardContent className="flex flex-col flex-grow p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 max-w-[70%]">
                      <h3 className="font-medium truncate">
                        {option.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {option.complexity || "Basic"}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        {(option.discountedPrice ?? 0) > 0 &&
                        (option.discountedPrice ?? 0) < (option.price ?? 0) ? (
                          <>
                            <span className="text-muted-foreground line-through">
                              ₹{(option.price ?? 0).toFixed(2)}
                            </span>
                            <span className="text-destructive font-medium">
                              ₹{(option.discountedPrice ?? 0).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            ₹{(option.price ?? 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditOption(option)}
                        className="h-8 w-8"
                        disabled={!inventoryPermission.edit}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(option)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={!inventoryPermission.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">
            Loading customization details...
          </p>
        </div>
      )}

      <ImagePickerModal
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onImageSelect={handleImageSelect}
        imageInfo={{
          resourceName: "customization",
          resourceId: Number(currentEditingId),
          subResourceName: selectedCustomization?.type,
          subResourceId: Number(currentEditingId),
        }}
      />

      <Dialog open={optionModalOpen} onOpenChange={setOptionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isNewOption ? "Add Option" : "Edit Option"}
            </DialogTitle>
          </DialogHeader>
          {editingOption && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="option-title">Title</Label>
                <Input
                  id="option-title"
                  value={editingOption.title || ""}
                  onChange={(e) =>
                    setEditingOption({
                      ...editingOption,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="option-complexity">Complexity</Label>
                <Select
                  value={editingOption.complexity || "Basic"}
                  onValueChange={(value) => {
                    setEditingOption({
                      ...editingOption,
                      complexity: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="option-price">Price</Label>
                  <Input
                    id="option-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingOption.price || 0}
                    onChange={(e) =>
                      setEditingOption({
                        ...editingOption,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="option-discounted-price">
                    Discounted Price
                  </Label>
                  <Input
                    id="option-discounted-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingOption.discountedPrice || 0}
                    onChange={(e) =>
                      setEditingOption({
                        ...editingOption,
                        discountedPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Image</Label>
                <div className="flex items-center gap-2">
                  <ImagePreview
                    src={
                      editingOption.imageUrl ||
                      "https://placehold.co/400x400/EFEFEF/AAAAAA?text=No+Image"
                    }
                    alt={editingOption.title || "Untitled"}
                    className="h-20 w-20 object-cover rounded"
                    showRemoveButton={false}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setImagePickerOpen(true)}
                  >
                    <Image className="h-4 w-4 mr-1" />
                    Change Image
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleOptionModalCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleOptionModalSave}
              disabled={
                !inventoryPermission.edit || !inventoryPermission.create
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomizationsEditor;
