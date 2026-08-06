"use client";
import React, { useState } from "react";
import { ContentPermissions, FNQ } from "@/types/interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { UpdatePageSectionData } from "@/services";
import { generateErrorMessage } from "@/lib/helpers";

interface FnQEditorProps {
  initialFnqs?: FNQ[];
  onChange?: (fnqs: FNQ[]) => void;
  contentPermissions: ContentPermissions;
}

const FnQEditor: React.FC<FnQEditorProps> = ({
  initialFnqs = [],
  onChange,
  contentPermissions,
}) => {
  const [fnqs, setFnqs] = useState<FNQ[]>(initialFnqs);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await UpdatePageSectionData(fnqs, "fnq");
      toast({
        title: "Changes saved",
        description: "FAQs have been updated successfully.",
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

  const handleAddFnq = () => {
    const newId = fnqs.length > 0 ? Math.max(...fnqs.map((f) => f.id)) + 1 : 1;

    const newFnq: FNQ = {
      id: newId,
      isActive: true,
      question: "New Question",
      answer: "New Answer",
    };

    const updatedFnqs = [...fnqs, newFnq];
    setFnqs(updatedFnqs);
    setIsEditing(newId);
    setHasChanges(true);
    onChange?.(updatedFnqs);
  };

  const handleRemoveFnq = (id: number) => {
    const updatedFnqs = fnqs.filter((f) => f.id !== id);
    setFnqs(updatedFnqs);
    if (isEditing === id) setIsEditing(null);
    setHasChanges(true);
    onChange?.(updatedFnqs);
  };

  const handleInputChange = <K extends keyof FNQ>(
    id: number,
    field: K,
    value: FNQ[K],
  ) => {
    const updatedFnqs = fnqs.map((fnq) =>
      fnq.id === id ? { ...fnq, [field]: value } : fnq,
    );
    setFnqs(updatedFnqs);
    setHasChanges(true);
    onChange?.(updatedFnqs);
  };

  const currentEditingFnq =
    isEditing !== null ? fnqs.find((f) => f.id === isEditing) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handleAddFnq}
            variant="outline"
            size="sm"
            disabled={!contentPermissions.create}
          >
            <Plus className="h-4 w-4 mr-2" /> Add FAQ
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

      <div className="space-y-4">
        {fnqs.map((fnq) => (
          <Card
            key={fnq.id}
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
              isEditing === fnq.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-base">{fnq.question}</h3>
                    <Switch
                      checked={fnq.isActive}
                      onCheckedChange={(val) =>
                        handleInputChange(fnq.id, "isActive", val)
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fnq.answer}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(fnq.id)}
                    className="h-8 w-8"
                    disabled={!contentPermissions.edit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFnq(fnq.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={!contentPermissions.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {fnqs.length === 0 && (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No FAQs yet. Add one to get started.
            </p>
            <Button
              onClick={handleAddFnq}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!contentPermissions.create}
            >
              <Plus className="h-4 w-4 mr-2" /> Add FAQ
            </Button>
          </div>
        )}
      </div>

      {/* Modal for Editing  */}
      {currentEditingFnq && (
        <Dialog
          open={isEditing !== null}
          onOpenChange={(open) => !open && setIsEditing(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit FAQ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Input
                  value={currentEditingFnq.question}
                  onChange={(e) =>
                    handleInputChange(isEditing!, "question", e.target.value)
                  }
                  placeholder="Enter question"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Answer</label>
                <Textarea
                  value={currentEditingFnq.answer}
                  onChange={(e) =>
                    handleInputChange(isEditing!, "answer", e.target.value)
                  }
                  placeholder="Enter answer"
                  rows={4}
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
    </div>
  );
};

export default FnQEditor;
