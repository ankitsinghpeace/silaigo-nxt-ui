"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { IMeasurementCategory, IMeasurementField } from "@/types/interface";
// import { bodyMeasurements } from "@/services/constants";
import { listMeasurementFields } from "@/services/modules/measurement-category.api";
import { useQuery } from "@tanstack/react-query";

interface CategoryFieldsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: IMeasurementCategory;
  onAdd?: (category: IMeasurementCategory) => void;
  onEdit?: (category: IMeasurementCategory) => void;
  isSaving?: boolean;
}

export const MeasurementsSeetingsModal: React.FC<CategoryFieldsModalProps> = ({
  isOpen,
  onOpenChange,
  initialCategory,
  onAdd,
  onEdit,
  isSaving,
}) => {
  const [categoryData, setCategoryData] = useState<IMeasurementCategory>({
    name: initialCategory?.name || "",
    label: initialCategory?.label || "",
    fields: initialCategory?.fields || [],
  });

  useEffect(() => {
    if (initialCategory) {
      setCategoryData({
        name: initialCategory.name,
        label: initialCategory.label,
        fields: initialCategory.fields,
      });
    } else {
      setCategoryData({ name: "", label: "", fields: [] });
    }
  }, [initialCategory]);

  const toggleField = (field: IMeasurementField) => {
    setCategoryData((prev) => {
      const exists = prev.fields.find((f) => f.id === field.id);
      const newFields = exists
        ? prev.fields.filter((f) => f.id !== field.id)
        : [...prev.fields, field];
      return { ...prev, fields: newFields };
    });
  };

  const handleSave = () => {
    if (initialCategory.name) {
      onEdit?.(categoryData);
    } else {
      onAdd?.(categoryData);
    }
  };

  const handleCancel = () => {
    setCategoryData({
      name: initialCategory?.name || "",
      label: initialCategory?.label || "",
      fields: initialCategory?.fields || [],
    });
    onOpenChange(false);
  };

  // measurement fields

  const { data: bodyMeasurements, isLoading: loadingMFields, isError: mFieldsError } = useQuery<IMeasurementField[]>({
    queryKey: ["measurement-fields"],
    queryFn: () => listMeasurementFields(),
  });


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialCategory ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {initialCategory
              ? "Edit the category details and select fields."
              : "Enter category details and select fields."}
          </DialogDescription>
        </DialogHeader>

        {/* Category Name */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="categoryName">Category Name</Label>
          <input
            id="categoryName"
            className="w-full border rounded p-2"
            placeholder="Internal name"
            value={categoryData.name}
            onChange={(e) =>
              setCategoryData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        {/* Category Label */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="categoryLabel">Category Label</Label>
          <input
            id="categoryLabel"
            className="w-full border rounded p-2"
            placeholder="Display label"
            value={categoryData.label}
            onChange={(e) =>
              setCategoryData((prev) => ({ ...prev, label: e.target.value }))
            }
          />
        </div>

        {/* Available Fields */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Select Fields</h3>
          <div className="grid gap-2">
            {loadingMFields && <div className="text-center">Loading...</div>}
            {bodyMeasurements?.map.length > 0 ? bodyMeasurements?.map((field) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={field.id}
                  checked={!!categoryData.fields.find((f) => f.id === field.id)}
                  onChange={() => toggleField(field)}
                />
                <Label htmlFor={field.id}>{field.name}</Label>
              </div>
            )) : <div>No Measurement Fields Found</div>}
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !categoryData.name || !categoryData.label}
          >
            {initialCategory ? "Update" : "Save"}{" "}
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
