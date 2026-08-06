"use client";
import React, { useEffect, useState } from "react";
import { Category, ContentPermissions } from "@/types/interface";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Pencil, Plus, Save, X, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImagePreview from "@/components/admin/ImagePreview";
import ImagePickerModal from "@/components/admin/modals/image.picker.modal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  updateCategories,
  createCategory,
  deleteCategory,
  getMetaTypes,
} from "@/services";
import SubCategoriesEditor from "./SubCategoriesEditor";

export enum Action {
  NONE = "NONE",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

type inventoryPermissions = ContentPermissions;

interface CategoriesEditorProps {
  categories: Category[];
  inventoryPermission: inventoryPermissions;
}

const CategoriesEditor: React.FC<CategoriesEditorProps> = ({
  categories: initialCategories,
  inventoryPermission,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [action, setAction] = useState<Action>(Action.NONE);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [addLabel, setAddLabel] = useState(false);
  const [labeltypes, setLabeltypes] = useState<string[]>([]);
  const { toast } = useToast();

  // Option management state
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null,
  );
  const [editingOption, setEditingOption] = useState<{
    title: string;
    discountedPrice: number;
    price: number;
  } | null>(null);
  const [newOption, setNewOption] = useState<{
    title: string;
    discountedPrice: number;
    price: number;
  }>({ title: "", discountedPrice: 0, price: 0 });

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

  const handleUpdate = (
    field: keyof Category,
    value:
      | string
      | boolean
      | number
      | undefined
      | { title: string; discountedPrice: number; price: number }[],
  ) => {
    if (!currentCategory) return;
    setCurrentCategory({
      ...currentCategory,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!currentCategory) return;

    const updatedCategory = {
      ...currentCategory,
      label: addLabel ? currentCategory.label : undefined,
    };

    try {
      if (action === Action.CREATE) {
        const createdCategory = await createCategory(updatedCategory);
        const updatedCats = categories.map((c) =>
          c.id === currentCategory.id ? createdCategory : c,
        );
        setCategories(updatedCats);
        toast({
          title: "Success",
          description: "New category created successfully.",
        });
      } else if (action === Action.UPDATE) {
        await updateCategories(currentCategory.id, updatedCategory);
        setCategories(
          categories.map((c) =>
            c.id === currentCategory.id ? updatedCategory : c,
          ),
        );
        toast({
          title: "Success",
          description: "Category updated successfully.",
        });
      }
      resetState();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = () => {
    const newId =
      categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const rank =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.rank)) + 1
        : 1;

    const newCat: Category = {
      id: newId,
      name: "New Category",
      isActive: true,
      isVisibleOnHomePage: true,
      imageUrl: "",
      coverImageUrl: "",
      description: "",
      label: { type: "", title: "", color: "" },
      rank: rank,
      data: [],
      options: [],
    };

    setCurrentCategory(newCat);
    setCategories([...categories, newCat]);
    setAction(Action.CREATE);
    setAddLabel(false);
    toast({
      title: "New Category",
      description: "Please fill in the category details and click save.",
    });
  };

  const handleDeleteCategory = (category: Category) => {
    setCurrentCategory(category);
    setAction(Action.DELETE);
    setDeleteConfirmOpen(true);
  };

  const handleImageEdit = () => {
    if (!currentCategory) return;
    setImagePickerOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (!currentCategory) return;
    setCurrentCategory({ ...currentCategory, imageUrl: url });
    setCategories(
      categories.map((c) =>
        c.id === currentCategory.id ? { ...c, imageUrl: url } : c,
      ),
    );
  };

  const handleCoverImageEdit = () => {
    if (!currentCategory) return;
    setImagePickerOpen(true);
  };

  const handleCoverImageSelect = (url: string) => {
    if (!currentCategory) return;
    setCurrentCategory({ ...currentCategory, coverImageUrl: url });
    setCategories(
      categories.map((c) =>
        c.id === currentCategory.id ? { ...c, coverImageUrl: url } : c,
      ),
    );
  };

  const handleOpenStylesModal = () => {
    if (!currentCategory) return;
    setStyleModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      await deleteCategory(currentCategory.id);
      setCategories(categories.filter((c) => c.id !== currentCategory.id));
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      resetState();
    }
  };

  const resetState = () => {
    setCurrentCategory(null);
    setAction(Action.NONE);
    setDeleteConfirmOpen(false);
    setImagePickerOpen(false);
    setStyleModalOpen(false);
    setAddLabel(false);
  };

  // Add new option
  const handleAddOption = () => {
    if (!currentCategory) return;
    if (!newOption.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    handleUpdate("options", [
      ...(currentCategory.options || []),
      { ...newOption },
    ]);
    setNewOption({ title: "", discountedPrice: 0, price: 0 });
    toast({ title: "Success", description: "Option added" });
  };

  // Start editing an option
  const handleEditOption = (
    idx: number,
    option: { title: string; discountedPrice: number; price: number },
  ) => {
    setEditingOptionIndex(idx);
    setEditingOption({ ...option });
  };

  // Save option edit
  const handleSaveOption = () => {
    if (editingOptionIndex === null || !editingOption || !currentCategory)
      return;
    if (!editingOption.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    const updatedOptions = [...(currentCategory.options || [])];
    updatedOptions[editingOptionIndex] = { ...editingOption };
    handleUpdate("options", updatedOptions);
    setEditingOptionIndex(null);
    setEditingOption(null);
    toast({ title: "Success", description: "Option updated" });
  };

  // Cancel option edit
  const handleCancelOption = () => {
    setEditingOptionIndex(null);
    setEditingOption(null);
  };

  // Delete option
  const handleDeleteOption = (idx: number) => {
    if (!currentCategory) return;
    const updatedOptions = [...(currentCategory.options || [])];
    updatedOptions.splice(idx, 1);
    handleUpdate("options", updatedOptions);
    toast({ title: "Success", description: "Option deleted" });
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Edit Categories</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCategory}
          disabled={!inventoryPermission.create}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories
          .sort((a, b) => a.rank - b.rank)
          .map((cat) => {
            const isEditing = currentCategory?.id === cat.id;

            return (
              <Card
                key={cat.id}
                className={`relative p-5 shadow-sm transition-shadow rounded-md ${
                  isEditing ? "ring-2 ring-primary/70" : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 m-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Rank: {cat.rank}
                        </span>
                      </div>
                      {cat.imageUrl ? (
                        <ImagePreview
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-[15vh] w-[10vh] rounded-md object-cover border border-gray-300"
                          onRemove={
                            isEditing
                              ? () => handleUpdate("imageUrl", "")
                              : undefined
                          }
                        />
                      ) : (
                        <div className="h-[15vh] w-[10vh] bg-muted rounded-md flex items-center justify-center border border-gray-300">
                          <Image className="h-[15vh] w-[10vh] text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-1 min-w-0">
                      <h3 className="text-xl font-semibold truncate">
                        {cat.name}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground truncate"
                        title={cat.description}
                      >
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {isEditing && currentCategory && (
                    <>
                      {/* Main Image Edit */}
                      <Button
                        className="w-full mb-3 mt-4"
                        variant="outline"
                        onClick={handleImageEdit}
                        size="sm"
                        disabled={!inventoryPermission.edit}
                      >
                        Edit Main Image
                      </Button>

                      {/* Cover Image Edit */}
                      <Button
                        className="w-full mb-3"
                        variant="outline"
                        onClick={handleCoverImageEdit}
                        size="sm"
                        disabled={!inventoryPermission.edit}
                      >
                        Edit Cover Image
                      </Button>

                      {/* Cover Image Preview */}
                      {currentCategory.coverImageUrl && (
                        <ImagePreview
                          src={currentCategory.coverImageUrl}
                          alt="Cover Image"
                          className="max-h-[200px] w-full rounded-md object-contain mb-4"
                        />
                      )}

                      {/* Name and Description inputs */}
                      <div className="flex gap-10 my-4">
                        <Input
                          value={currentCategory.name}
                          onChange={(e) => handleUpdate("name", e.target.value)}
                          placeholder="Category Name"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-10 my-4">
                        <Input
                          value={parseFloat(currentCategory.rank.toString())}
                          onChange={(e) =>
                            handleUpdate("rank", parseFloat(e.target.value))
                          }
                          placeholder="Rank"
                          className="flex-1"
                          type="number"
                        />
                      </div>
                      <div className="flex gap-10">
                        <Textarea
                          rows={1}
                          value={currentCategory.description}
                          onChange={(e) =>
                            handleUpdate("description", e.target.value)
                          }
                          placeholder="Description"
                          className="flex-1 resize-none"
                        />
                      </div>

                      <div className="flex justify-between items-center border-t pt-4 mt-4">
                        <label className="flex items-center gap-3">
                          <Switch
                            checked={currentCategory.isActive}
                            onCheckedChange={(v) => handleUpdate("isActive", v)}
                          />
                          <span>Active</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <Switch
                            checked={currentCategory.isVisibleOnHomePage}
                            onCheckedChange={(v) =>
                              handleUpdate("isVisibleOnHomePage", v)
                            }
                          />
                          <span>Show on Homepage</span>
                        </label>
                      </div>

                      {/* Label Section */}
                      <div className="space-y-3 pt-5">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <Switch
                            checked={addLabel}
                            onCheckedChange={setAddLabel}
                          />
                          <span className="font-semibold text-base">
                            Add Tag
                          </span>
                        </label>

                        {addLabel && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium block mb-1">
                                Label Type
                              </label>
                              <select
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={currentCategory.label?.type || ""}
                                onChange={(e) =>
                                  handleUpdate("label", {
                                    ...currentCategory.label,
                                    type: e.target.value,
                                  })
                                }
                                required
                              >
                                <option value="">Select Type</option>
                                {labeltypes.map((type: any) => (
                                  <option
                                    key={type.subType}
                                    value={type.subType}
                                  >
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
                                value={currentCategory.label?.title || ""}
                                onChange={(e) =>
                                  handleUpdate("label", {
                                    ...currentCategory.label,
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
                                value={
                                  currentCategory.label?.color || "#000000"
                                }
                                onChange={(e) =>
                                  handleUpdate("label", {
                                    ...currentCategory.label,
                                    color: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Options Section */}
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Options
                        </label>
                        <div className="flex flex-col gap-3">
                          {currentCategory?.options?.map((option, idx) => (
                            <div
                              key={option.title + idx}
                              className="border rounded p-3 flex flex-col md:flex-row md:items-end gap-2 bg-muted/30"
                            >
                              {editingOptionIndex === idx ? (
                                <>
                                  <div className="flex flex-col flex-1">
                                    <label className="text-xs mb-1">
                                      Title
                                    </label>
                                    <Input
                                      value={editingOption?.title || ""}
                                      onChange={(e) =>
                                        setEditingOption((o) =>
                                          o
                                            ? { ...o, title: e.target.value }
                                            : null,
                                        )
                                      }
                                      placeholder="Title"
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    <label className="text-xs mb-1">
                                      Discounted Price
                                    </label>
                                    <Input
                                      type="number"
                                      value={
                                        editingOption?.discountedPrice ?? 0
                                      }
                                      onChange={(e) =>
                                        setEditingOption((o) =>
                                          o
                                            ? {
                                                ...o,
                                                discountedPrice: parseFloat(
                                                  e.target.value,
                                                ),
                                              }
                                            : null,
                                        )
                                      }
                                      placeholder="Discounted Price"
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    <label className="text-xs mb-1">
                                      Price
                                    </label>
                                    <Input
                                      type="number"
                                      value={editingOption?.price ?? 0}
                                      onChange={(e) =>
                                        setEditingOption((o) =>
                                          o
                                            ? {
                                                ...o,
                                                price: parseFloat(
                                                  e.target.value,
                                                ),
                                              }
                                            : null,
                                        )
                                      }
                                      placeholder="Price"
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="flex gap-1 mt-2 md:mt-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleSaveOption}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelOption}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex flex-col flex-1">
                                    <label className="text-xs mb-1">
                                      Title
                                    </label>
                                    <div className="truncate">
                                      {option.title}
                                    </div>
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    <label className="text-xs mb-1">
                                      Discounted Price
                                    </label>
                                    <div>{option.discountedPrice}</div>
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    <label className="text-xs mb-1">
                                      Price
                                    </label>
                                    <div>{option.price}</div>
                                  </div>
                                  <div className="flex gap-1 mt-2 md:mt-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleEditOption(idx, option)
                                      }
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteOption(idx)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 mt-3 bg-muted/10 p-3 rounded">
                          <div className="flex flex-col flex-1">
                            <label className="text-xs mb-1">Title</label>
                            <Input
                              value={newOption.title}
                              onChange={(e) =>
                                setNewOption((o) => ({
                                  ...o,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Title"
                              className="w-full"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-xs mb-1">
                              Discounted Price
                            </label>
                            <Input
                              type="number"
                              value={newOption.discountedPrice}
                              onChange={(e) =>
                                setNewOption((o) => ({
                                  ...o,
                                  discountedPrice: parseFloat(e.target.value),
                                }))
                              }
                              placeholder="Discounted Price"
                              className="w-full"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-xs mb-1">Price</label>
                            <Input
                              type="number"
                              value={newOption.price}
                              onChange={(e) =>
                                setNewOption((o) => ({
                                  ...o,
                                  price: parseFloat(e.target.value),
                                }))
                              }
                              placeholder="Price"
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddOption}
                              className="w-full md:w-auto mt-2 md:mt-0"
                            >
                              Add Option
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Manage Styles Button */}
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStyleModalOpen(true)}
                          className="mt-4"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Styles
                        </Button>
                      </div>

                      <div className="flex justify-end gap-4 pt-6">
                        <Button variant="ghost" size="sm" onClick={resetState}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSave}
                          disabled={
                            !inventoryPermission.edit ||
                            !inventoryPermission.create
                          }
                        >
                          <Save className="h-4 w-4 mr-2" /> Save
                        </Button>
                      </div>
                    </>
                  )}

                  {!isEditing && (
                    <div className="flex justify-end mt-4  gap-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setCurrentCategory({ ...cat });
                          setAction(Action.UPDATE);
                          setAddLabel(!!cat.label);
                        }}
                        aria-label="Edit category"
                        disabled={!inventoryPermission.edit}
                      >
                        <Pencil className="h-5 w-5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteCategory(cat)}
                        aria-label="Delete category"
                        disabled={!inventoryPermission.delete}
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      <ImagePickerModal
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onImageSelect={(url) => {
          if (action === Action.UPDATE || action === Action.CREATE) {
            handleImageSelect(url);
          }
        }}
        imageInfo={{
          resourceName: "category",
          resourceId: currentCategory?.id,
        }}
      />
      <Dialog open={styleModalOpen} onOpenChange={setStyleModalOpen}>
        <DialogContent
          className="w-[calc(100%-100px)] h-[calc(100%-150px)] max-w-full max-h-full p-10 overflow-auto"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            position: "fixed",
          }}
        >
          <SubCategoriesEditor
            categoryId={currentCategory?.id?.toString() || ""}
            onClose={() => setStyleModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </p>
          <DialogFooter className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesEditor;
