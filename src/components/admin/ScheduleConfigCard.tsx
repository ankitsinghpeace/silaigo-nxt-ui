"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScheduleConfig } from "@/types/interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduleConfigApi,
  updateScheduleConfigApi,
} from "@/services/modules/appointments.api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionSubType, PermissionType } from "@/types/enums";

const ScheduleConfigCard = () => {
  const [editingScheduleConfig, setEditingScheduleConfig] =
    useState<ScheduleConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canEdit = user?.permissions?.includes(
    `${PermissionType.APPOINTMENTS}.${PermissionSubType.EDIT}`,
  );
  const canView = user?.permissions?.includes(
    `${PermissionType.APPOINTMENTS}.${PermissionSubType.VIEW}`,
  );

  const workingDaysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const {
    data: scheduleConfigData,
    isLoading: isScheduleConfigLoading,
    error: scheduleConfigError,
    refetch: refetchScheduleConfig,
  } = useQuery({
    queryKey: ["scheduleConfig"],
    queryFn: () => {
      if (!canView) {
        return Promise.reject(
          new Error("You don't have permission to view schedule configuration"),
        );
      }
      return getScheduleConfigApi();
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: (scheduleConfig: ScheduleConfig) => {
      if (!canEdit) {
        return Promise.reject(
          new Error(
            "You don't have permission to update schedule configuration",
          ),
        );
      }
      return updateScheduleConfigApi(scheduleConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleConfig"] });
      toast({
        title: "Success",
        description: "Schedule configuration updated successfully",
      });
      setIsEditing(false);
      refetchScheduleConfig();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update schedule configuration",
        variant: "destructive",
      });
    },
  });

  // Initialize editing state when data loads
  useEffect(() => {
    if (scheduleConfigData) {
      setEditingScheduleConfig(scheduleConfigData);
    }
  }, [scheduleConfigData]);

  const handleWorkingDayToggle = (day: string) => {
    if (!editingScheduleConfig) return;

    setEditingScheduleConfig((prev) => ({
      ...prev!,
      workingDays: prev!.workingDays.includes(day)
        ? prev!.workingDays.filter((d) => d !== day)
        : [...prev!.workingDays, day],
    }));
  };

  const handleSave = () => {
    if (!editingScheduleConfig) return;
    updateScheduleMutation.mutate(editingScheduleConfig);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingScheduleConfig(scheduleConfigData);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isScheduleConfigLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (scheduleConfigError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32 text-red-500">
          Error loading schedule configuration
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule Configuration</CardTitle>
            <CardDescription>
              Configure global appointment scheduling settings
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
              disabled={!canEdit}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editingScheduleConfig && (
          <div className="space-y-6">
            {/* Working Days */}
            <div>
              <Label className="text-base font-medium">Working Days</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {workingDaysOptions.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Switch
                      checked={editingScheduleConfig.workingDays.includes(day)}
                      onCheckedChange={() => handleWorkingDayToggle(day)}
                      disabled={!isEditing}
                    />
                    <Label
                      className={!isEditing ? "text-muted-foreground" : ""}
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={editingScheduleConfig.dailyHours.startTime}
                  onChange={(e) =>
                    setEditingScheduleConfig((prev) => ({
                      ...prev!,
                      dailyHours: {
                        ...prev!.dailyHours,
                        startTime: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={editingScheduleConfig.dailyHours.endTime}
                  onChange={(e) =>
                    setEditingScheduleConfig((prev) => ({
                      ...prev!,
                      dailyHours: {
                        ...prev!.dailyHours,
                        endTime: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Slot Interval */}
            <div>
              <Label htmlFor="slotInterval">Slot Interval (minutes)</Label>
              <Select
                value={editingScheduleConfig.slotIntervalMinutes?.toString()}
                onValueChange={(value) =>
                  setEditingScheduleConfig((prev) => ({
                    ...prev!,
                    slotIntervalMinutes: parseInt(value),
                  }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Appointments Per Slot */}
            <div>
              <Label htmlFor="maxAppointments">Max Appointments Per Slot</Label>
              <Input
                id="maxAppointments"
                type="number"
                min="1"
                max="10"
                value={editingScheduleConfig.maxAppointmentsPerSlot}
                onChange={(e) =>
                  setEditingScheduleConfig((prev) => ({
                    ...prev!,
                    maxAppointmentsPerSlot: parseInt(e.target.value),
                  }))
                }
                disabled={!isEditing}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingScheduleConfig.isActive}
                onCheckedChange={(checked) =>
                  setEditingScheduleConfig((prev) => ({
                    ...prev!,
                    isActive: checked,
                  }))
                }
                disabled={!isEditing}
              />
              <Label className={!isEditing ? "text-muted-foreground" : ""}>
                Active
              </Label>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateScheduleMutation.isPending || !canEdit}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateScheduleMutation.isPending || !canEdit}
                >
                  {updateScheduleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleConfigCard;
