"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Pencil, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ImagePickerModal from "@/components/admin/modals/image.picker.modal";
import {
  fetchSubCategoryData,
  getMetaTypes,
  updateCategoryStyles,
} from "@/services";
import { Subcategory } from "@/types/interface";
import { ObjectId } from "bson";

import Ribbon, { RibbonType } from "@/components/admin/modals/ribbon";
import { Switch } from "@radix-ui/react-switch";

interface SubCategoriesEditorProps {
  categoryId: string;
  onClose: () => void;
}

// Predefined ribbons to use (you can load this dynamically or extend later)
const ribbonOptions: RibbonType[] = [
  { title: "New", color: "bg-green-500 text-white", type: "new" },
  { title: "Sale", color: "bg-red-500 text-white", type: "sale" },
  { title: "Exclusive", color: "bg-purple-600 text-white", type: "exclusive" },
];

const SubCategoriesEditor: React.FC<SubCategoriesEditorProps> = ({
  categoryId,
  onClose,
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [category, setCategory] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [addLabel, setAddLabel] = useState(false);
  const [labeltypes, setLabeltypes] = useState<string[]>([]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const { toast } = useToast();

  const handleImageSelect = (url: string) => {
    if (!editingSubcategory) return;
    editingSubcategory.image = url;
    setEditingSubcategory(editingSubcategory);
  };

  useEffect(() => {
    const fetchMetaTypes = async () => {
      try {
        const types = await getMetaTypes();
        setLabeltypes(types);
      } catch (err) {
        console.error("Failed to fetch meta types", err);
      }
    };
    fetchMetaTypes();
  }, []);

  useEffect(() => {
    if (editingSubcategory) {
      setAddLabel(!!editingSubcategory.label);
    }
  }, [editingSubcategory]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchSubCategoryData(Number(categoryId));
        setCategory({ name: res.name, description: res.description });
        const subs = res.styles.map((sub: Subcategory) => ({
          ...sub,
          price: sub.price ?? 0,
          discountedPrice: sub.discountedPrice ?? 0,
          // Convert label string to ribbon object or null
          ribbon: sub.label
            ? (ribbonOptions.find((r) => r.title === sub.label) ?? null)
            : null,
          _id: sub._id.toString(),
        }));
        setSubcategories(subs);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [categoryId, toast]);

  // Open modal to edit a subcategory
  const openEditModal = (sub: Subcategory) => {
    setEditingSubcategory({ ...sub });
    setEditModalOpen(true);
  };

  // Add new subcategory and open modal immediately
  const handleAddSubcategory = () => {
    const rank =
      subcategories.length > 0
        ? Math.max(...subcategories.map((c) => c.rank)) + 1
        : 1;
    const newSub = {
      _id: ObjectId,
      name: "",
      image: "",
      description: "",
      categoryId: Number(categoryId),
      keyAttributes: [],
      price: 0,
      discountedPrice: 0,
      ribbon: null,
      rank: rank,
    };
    setEditingSubcategory(newSub as any);
    setEditModalOpen(true);
  };

  // Delete subcategory from the list
  const handleDeleteSubcategory = (id: string) => {
    setSubcategories(subcategories.filter((sub) => sub._id !== id));
    setHasChanges(true);
    if (editingSubcategory?._id === id) {
      setEditModalOpen(false);
      setEditingSubcategory(null);
    }
  };

  // Save modal changes to main list state
  const handleSaveModalChanges = () => {
    if (!editingSubcategory) return;

    if (!editingSubcategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }
    if (!editingSubcategory.image.trim()) {
      toast({
        title: "Validation Error",
        description: "Image is required.",
        variant: "destructive",
      });
      return;
    }

    const updatedList = subcategories.some(
      (sub) => sub._id === editingSubcategory._id,
    )
      ? subcategories.map((sub) =>
          sub._id === editingSubcategory._id ? editingSubcategory : sub,
        )
      : [...subcategories, editingSubcategory];

    setSubcategories(updatedList);
    setHasChanges(true);
    setEditModalOpen(false);
    // setEditingSubcategory(null);
  };

  // Update field in modal state
  const handleModalFieldChange = (field: keyof Subcategory, value: any) => {
    if (!editingSubcategory) return;
    if (field === "keyAttributes") {
      setEditingSubcategory({
        ...editingSubcategory,
        [field]: value.split(","),
      });
      return;
    }
    setEditingSubcategory({ ...editingSubcategory, [field]: value });
  };

  // Image picker callback
  const onImagePicked = (imageUrl: string) => {
    handleModalFieldChange("image", imageUrl);
    setImagePickerOpen(false);
  };

  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    try {
      // When saving, convert ribbon object to label string for backend
      const payload = subcategories.map((sub) => ({
        ...sub,
        label: sub.label?.title ?? null,
      }));
      await updateCategoryStyles(Number(categoryId), payload);
      toast({
        title: "Success",
        description: "All changes saved successfully.",
      });
      setHasChanges(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex items-center mb-6">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </Button>

        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Subcategories for {category?.name}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {subcategories
          .sort((a, b) => a.rank - b.rank)
          .map((sub) => (
            <Card
              key={sub._id}
              className="p-4 flex flex-col justify-between border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rank: {sub.rank}
                </span>
              </div>
              <div>
                {sub.image ? (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-36 object-cover rounded-md mb-3"
                  />
                ) : (
                  <div className="w-full h-36 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 mb-3">
                    No Image
                  </div>
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {sub.name || "Unnamed"}
                </h2>
                {sub.label && (
                  <span
                    className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      sub.label.color ?? "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {sub.label.title}
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(sub)}
                  className="flex items-center gap-1"
                >
                  <Pencil size={16} />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSubcategory(sub._id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Button
          onClick={handleAddSubcategory}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Subcategory
        </Button>
        <Button
          onClick={handleSaveAllChanges}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Save size={16} />
          )}
          Save Changes
        </Button>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="w-[calc(100%-100px)] h-[calc(100%-150px)] max-w-full max-h-full p-10 overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory &&
              subcategories.find((s) => s._id === editingSubcategory._id)
                ? "Edit Subcategory"
                : "Add New Subcategory"}
            </DialogTitle>
          </DialogHeader>

          {editingSubcategory && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModalChanges();
              }}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name <span className="text-red-600">*</span>
                </label>
                <Input
                  id="name"
                  value={editingSubcategory.name}
                  onChange={(e) =>
                    handleModalFieldChange("name", e.target.value)
                  }
                  required
                  autoFocus
                  placeholder="Subcategory name"
                />
              </div>

              <div>
                <label
                  htmlFor="rank"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rank <span className="text-red-600">*</span>
                </label>
                <Input
                  value={parseFloat(editingSubcategory.rank.toString())}
                  onChange={(e) =>
                    handleModalFieldChange("rank", parseFloat(e.target.value))
                  }
                  placeholder="Rank"
                  className="flex-1"
                  type="number"
                />
              </div>

              <div>
                <label
                  htmlFor="keyAttributes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  KeyAttributes ( separated by comma(,))
                </label>
                <Input
                  value={editingSubcategory.keyAttributes.join(",")}
                  onChange={(e) =>
                    handleModalFieldChange("keyAttributes", e.target.value)
                  }
                  placeholder="Enter keyattributes separated by comma(,)"
                  className="flex-1"
                  type="text"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={editingSubcategory.description}
                  onChange={(e) =>
                    handleModalFieldChange("description", e.target.value)
                  }
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price
                  </label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={editingSubcategory.price}
                    onChange={(e) =>
                      handleModalFieldChange("price", Number(e.target.value))
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discountedPrice"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discounted Price
                  </label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    min={0}
                    value={editingSubcategory.discountedPrice}
                    onChange={(e) =>
                      handleModalFieldChange(
                        "discountedPrice",
                        Number(e.target.value),
                      )
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image <span className="text-red-600">*</span>
                </label>
                {editingSubcategory.image ? (
                  <img
                    src={editingSubcategory.image}
                    alt={editingSubcategory.name}
                    className="w-full h-48 object-cover rounded-md mb-3 border border-gray-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 mb-3">
                    No image selected
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => setImagePickerOpen(true)}
                >
                  {editingSubcategory.image ? "Change Image" : "Select Image"}
                </Button>
              </div>

              {/* Label Section */}
              <div className="space-y-3 pt-5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <Switch
                    checked={addLabel}
                    onCheckedChange={(checked) => {
                      setAddLabel(checked);
                      if (checked) {
                        if (!editingSubcategory?.label) {
                          handleModalFieldChange("label", {
                            title: "",
                            color: "#000000",
                            type: "",
                          });
                        }
                      } else {
                        handleModalFieldChange("label", null);
                      }
                    }}
                  />
                  <span className="font-semibold text-base">Add Tag</span>
                </label>

                {addLabel && editingSubcategory?.label && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Label Type
                      </label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={editingSubcategory.label.type || ""}
                        onChange={(e) =>
                          handleModalFieldChange("label", {
                            ...editingSubcategory.label,
                            type: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Type</option>
                        {labeltypes.map((type: any) => (
                          <option key={type.subType} value={type.subType}>
                            {type?.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Label Title
                      </label>
                      <Input
                        value={editingSubcategory.label.title || ""}
                        onChange={(e) =>
                          handleModalFieldChange("label", {
                            ...editingSubcategory.label,
                            title: e.target.value,
                          })
                        }
                        placeholder="Enter Title"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Label Color
                      </label>
                      <input
                        type="color"
                        className="w-full h-10 rounded cursor-pointer"
                        value={editingSubcategory.label.color || "#000000"}
                        onChange={(e) =>
                          handleModalFieldChange("label", {
                            ...editingSubcategory.label,
                            color: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2 inline-block" />
                  ) : null}
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Picker Modal */}
      <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <ImagePickerModal
            open={imagePickerOpen}
            onOpenChange={setImagePickerOpen}
            onImageSelect={(url) => {
              handleImageSelect(url);
            }}
            imageInfo={{
              resourceName: "subcategory",
              resourceId: editingSubcategory
                ? Number(editingSubcategory._id)
                : undefined,
            }}
          />
          <DialogFooter>
            <Button onClick={() => setImagePickerOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubCategoriesEditor;
