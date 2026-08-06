"use client";
import React, { useState, useEffect } from "react";
import { ContentPermissions, JourneyStep } from "@/types/interface";
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

interface JourneyEditorProps {
  journey: {
    title: string;
    subtitle: string;
    steps: JourneyStep[];
  };
  onChange?: (journey: {
    title: string;
    subtitle: string;
    steps: JourneyStep[];
  }) => void;
  contentPermissions: ContentPermissions;
}

const JourneyEditor: React.FC<JourneyEditorProps> = ({
  journey: initialJourney,
  onChange,
  contentPermissions,
}) => {
  const [journey, setJourney] = useState(initialJourney);
  const [isEditingStep, setIsEditingStep] = useState<number | null>(null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasChanges(false);
  }, [initialJourney]);

  const handleAddStep = () => {
    const newId =
      journey.steps.length > 0
        ? Math.max(...journey.steps.map((s) => s.id)) + 1
        : 1;

    const newStep: JourneyStep = {
      id: newId,
      title: "New Step",
      description: "Description for the new step",
      imageUrl: "",
      isActive: true,
      link: "",
      linkType: "redirection",
    };

    const updated = { ...journey, steps: [...journey.steps, newStep] };
    setJourney(updated);
    setIsEditingStep(newId);
    setHasChanges(true);
    if (onChange) onChange(updated);
  };

  const handleRemoveStep = (id: number) => {
    const updated = {
      ...journey,
      steps: journey.steps.filter((s) => s.id !== id),
    };
    setJourney(updated);
    setHasChanges(true);
    if (onChange) onChange(updated);
  };

  const handleMoveStep = (index: number, dir: "up" | "down") => {
    const newSteps = [...journey.steps];
    const newIndex = dir === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSteps.length) return;
    [newSteps[index], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[index],
    ];
    const updated = { ...journey, steps: newSteps };
    setJourney(updated);
    setHasChanges(true);
    if (onChange) onChange(updated);
  };

  const handleStepChange = (
    id: number,
    field: keyof JourneyStep,
    value: string | boolean,
  ) => {
    const updated = {
      ...journey,
      steps: journey.steps.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    };
    setJourney(updated);
    setHasChanges(true);
    if (onChange) onChange(updated);
  };

  const handleFinalSave = async () => {
    setIsLoading(true);
    try {
      await UpdatePageSectionData(journey, "journey", false);
      toast({
        title: "Saved Successfully",
        description: "Journey section has been updated.",
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

  const currentEditingStep =
    isEditingStep !== null
      ? journey.steps.find((s) => s.id === isEditingStep)
      : null;

  const handleImageSelect = (url: string) => {
    if (isEditingStep !== null) {
      handleStepChange(isEditingStep, "imageUrl", url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Journey Section
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleAddStep}
            variant="outline"
            size="sm"
            disabled={!contentPermissions.create}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Step
          </Button>
          <Button
            onClick={handleFinalSave}
            disabled={!hasChanges || isLoading}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card className={`${isEditingHeader ? "ring-2 ring-primary" : ""}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {journey.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {journey.subtitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingHeader(true)}
              disabled={!contentPermissions.edit}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit Header
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {journey.steps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all overflow-hidden rounded-xl shadow-sm border border-border/30 ${
              isEditingStep === step.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="relative h-48">
              <ImagePreview
                src={step.imageUrl || "https://placehold.co/600x400"}
                alt={step.title}
                showRemoveButton={false}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-base flex-1 truncate">
                  {step.title}
                </h3>
                <Switch
                  checked={step.isActive}
                  onCheckedChange={(val) =>
                    handleStepChange(step.id, "isActive", val)
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {step.description}
              </p>
              {step.link && (
                <p className="text-xs text-blue-600 truncate">
                  {step.linkType === "action" ? "⚙️ Action" : "🔗 Redirect"}:{" "}
                  {step.link}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveStep(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveStep(index, "down")}
                    disabled={index === journey.steps.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingStep(step.id)}
                    disabled={!contentPermissions.edit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleRemoveStep(step.id)}
                    disabled={!contentPermissions.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={isEditingStep !== null}
        onOpenChange={(open) => !open && setIsEditingStep(null)}
      >
        {currentEditingStep && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Step</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Image</label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setImagePickerOpen(true);
                  }}
                >
                  Choose Image
                </Button>
                {currentEditingStep.imageUrl && (
                  <img
                    src={currentEditingStep.imageUrl}
                    alt={currentEditingStep.title}
                    className="h-40 w-full object-cover rounded-md mt-2"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={currentEditingStep.title}
                  onChange={(e) =>
                    handleStepChange(
                      currentEditingStep.id,
                      "title",
                      e.target.value,
                    )
                  }
                  placeholder="Step Title"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={currentEditingStep.description}
                  onChange={(e) =>
                    handleStepChange(
                      currentEditingStep.id,
                      "description",
                      e.target.value,
                    )
                  }
                  placeholder="Description"
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Link</label>
                <Input
                  value={currentEditingStep.link || ""}
                  onChange={(e) =>
                    handleStepChange(
                      currentEditingStep.id,
                      "link",
                      e.target.value,
                    )
                  }
                  placeholder="https://example.com or #action"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Link Type</label>
                <select
                  className="w-full border border-border rounded-md p-2 text-sm"
                  value={currentEditingStep.linkType || "redirection"}
                  onChange={(e) =>
                    handleStepChange(
                      currentEditingStep.id,
                      "linkType",
                      e.target.value as "action" | "redirection",
                    )
                  }
                >
                  <option value="redirection">Redirection</option>
                  <option value="action">Action</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingStep(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditingStep(null)}
                disabled={
                  !contentPermissions.edit || !contentPermissions.create
                }
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ImagePickerModal
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onImageSelect={handleImageSelect}
        imageInfo={{
          resourceName: "journey",
          resourceId: currentEditingStep?.id || 0,
        }}
      />
    </div>
  );
};

export default JourneyEditor;
