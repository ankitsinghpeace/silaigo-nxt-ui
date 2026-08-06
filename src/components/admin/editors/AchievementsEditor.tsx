"use client";
import React, { useState } from "react";
import { Achievement, ContentPermissions } from "@/types/interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UpdatePageSectionData } from "@/services";

interface AchievementsEditorProps {
  achievements: Achievement[];
  showSaveButton?: boolean;
  onChange?: (achievements: Achievement[]) => void;
  contentPermissions: ContentPermissions;
}

const AchievementsEditor: React.FC<AchievementsEditorProps> = ({
  achievements: initialAchievements,
  showSaveButton = true,
  onChange,
  contentPermissions,
}) => {
  const [achievements, setAchievements] =
    useState<Achievement[]>(initialAchievements);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    try {
      await UpdatePageSectionData(achievements, "achievements");
      toast({
        title: "Changes saved",
        description: "Achievements have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAchievement = () => {
    const newId =
      achievements.length > 0
        ? Math.max(...achievements.map((a) => a.id)) + 1
        : 1;

    const newAchievement: Achievement = {
      id: newId,
      icon: "award",
      value: "New Value",
      label: "New Label",
    };

    setCurrentAchievement(newAchievement);
    setIsModalOpen(true);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setCurrentAchievement({ ...achievement });
    setEditingId(achievement.id);
    setIsModalOpen(true);
  };

  const handleRemoveAchievement = (id: number) => {
    const updatedAchievements = achievements.filter((a) => a.id !== id);
    setAchievements(updatedAchievements);
    if (editingId === id) setEditingId(null);

    if (onChange) {
      onChange(updatedAchievements);
    }
  };

  const handleSaveAchievement = () => {
    if (!currentAchievement) return;

    let updatedAchievements;

    if (editingId) {
      // Update existing achievement
      updatedAchievements = achievements.map((a) =>
        a.id === editingId ? currentAchievement : a,
      );
    } else {
      // Add new achievement
      updatedAchievements = [...achievements, currentAchievement];
    }

    setAchievements(updatedAchievements);
    setIsModalOpen(false);
    setCurrentAchievement(null);
    setEditingId(null);

    if (onChange) {
      onChange(updatedAchievements);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handleAddAchievement}
            variant="outline"
            size="sm"
            disabled={!contentPermissions.create}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
          {showSaveButton && (
            <Button onClick={handleSaveChanges} variant="default" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className="hover:shadow-md transition-shadow group"
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2 py-2">
                <div className="text-3xl font-bold text-primary">
                  {achievement.value}
                </div>
                <div className="text-sm font-medium">{achievement.label}</div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAchievement(achievement)}
                  disabled={!contentPermissions.edit}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveAchievement(achievement.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={!contentPermissions.delete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {achievements.length === 0 && (
          <div className="text-center p-6 border border-dashed rounded-lg col-span-4">
            <p className="text-muted-foreground">
              No achievements yet. Add one to get started.
            </p>
            <Button
              onClick={handleAddAchievement}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!contentPermissions.create}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Achievement" : "Add Achievement"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <Input
                value={currentAchievement?.icon || ""}
                onChange={(e) =>
                  currentAchievement &&
                  setCurrentAchievement({
                    ...currentAchievement,
                    icon: e.target.value,
                  })
                }
                placeholder="Icon name (e.g., award, star)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input
                value={currentAchievement?.value || ""}
                onChange={(e) =>
                  currentAchievement &&
                  setCurrentAchievement({
                    ...currentAchievement,
                    value: e.target.value,
                  })
                }
                placeholder="Achievement value"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                value={currentAchievement?.label || ""}
                onChange={(e) =>
                  currentAchievement &&
                  setCurrentAchievement({
                    ...currentAchievement,
                    label: e.target.value,
                  })
                }
                placeholder="Achievement label"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAchievement}
              disabled={!contentPermissions.edit || !contentPermissions.create}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementsEditor;
