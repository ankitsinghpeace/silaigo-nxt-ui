"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import ImagePreview from "@/components/admin/ImagePreview";
import { fetchSubCategoryData } from "@/services";
import SubcategoriesPage from "@/components/admin/editors/SubCategoriesEditor";

interface Style {
  id: number;
  name: string;
  image: string;
  description: string;
  keyAttributes: string[];
}

interface StyleEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: number | null;
  onSave: (updatedStyles: Style[]) => void;
}

const StyleEditorModal: React.FC<StyleEditorModalProps> = ({
  open,
  onOpenChange,
  categoryId,
  onSave,
}) => {
  const [localStyles, setLocalStyles] = useState<Style[]>([]);

  useEffect(() => {
    if (open && categoryId) {
      fetchSubCategoryData(categoryId).then(setLocalStyles);
    }
  }, [open, categoryId]);

  const handleUpdate = (id: number, field: keyof Style, value: any) => {
    setLocalStyles((prev) =>
      prev.map((style) =>
        style.id === id ? { ...style, [field]: value } : style
      )
    );
  };

  const handleAdd = () => {
    const newId =
      localStyles.length > 0
        ? Math.max(...localStyles.map((s) => s.id)) + 1
        : 1;
    const newStyle: Style = {
      id: newId,
      name: "New Style",
      image: "",
      description: "",
      keyAttributes: [],
    };
    setLocalStyles([...localStyles, newStyle]);
  };

  const handleRemove = (id: number) => {
    setLocalStyles((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Styles</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {localStyles.map((style) => (
            <div
              key={style.id}
              className="border rounded-lg p-4 space-y-3 bg-muted/10 relative"
            >
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(style.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Input
                value={style.name}
                onChange={(e) => handleUpdate(style.id, "name", e.target.value)}
                placeholder="Style Name"
              />

              <Input
                value={style.image}
                onChange={(e) =>
                  handleUpdate(style.id, "image", e.target.value)
                }
                placeholder="Image URL"
              />

              {style.image && (
                <ImagePreview
                  src={style.image}
                  alt={style.name}
                  className="h-40 rounded-md"
                  onRemove={() => handleUpdate(style.id, "image", "")}
                />
              )}

              <Textarea
                rows={3}
                value={style.description}
                onChange={(e) =>
                  handleUpdate(style.id, "description", e.target.value)
                }
                placeholder="Style Description"
              />

              <Input
                value={style.keyAttributes.join(", ")}
                onChange={(e) =>
                  handleUpdate(
                    style.id,
                    "keyAttributes",
                    e.target.value.split(",").map((k) => k.trim())
                  )
                }
                placeholder="Comma-separated attributes (e.g., elegant, minimal, bestseller)"
              />
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Style
          </Button>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={() => onSave(localStyles)}>
            <Save className="h-4 w-4 mr-2" /> Save Styles
          </Button>
        </DialogFooter>
      </DialogContent> */}
      <DialogContent style={{width:"100%"}}>
        <SubcategoriesPage {...({ categoryId: "1" } as any)} />
      </DialogContent>
    </Dialog>
  );
};

export default StyleEditorModal;
