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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { IAvailabilityOverride } from "@/types/interface";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addAvailabilityApi,
  deleteAvailabilityApi,
  getAvailabilitiesApi,
  updateAvailabilityApi,
} from "@/services/modules/appointments.api";
import { generateErrorMessage } from "@/lib/helpers";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionSubType, PermissionType } from "@/types/enums";

const getSlotInfo = (
  slots: Record<string, { isBlocked?: boolean; maxAppointments?: number }>,
) => {
  if (!slots || Object.keys(slots).length === 0) return "No slots configured";

  const slotDetails = Object.entries(slots)
    .map(([time, slotData]) => {
      return `${time} (${slotData.isBlocked ? "Blocked" : `${slotData.maxAppointments} max`})`;
    })
    .join(", ");

  return slotDetails;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getTypeBadge = (type: "HOLIDAY" | "CUSTOM") => {
  return type === "HOLIDAY" ? (
    <Badge variant="destructive">Holiday</Badge>
  ) : (
    <Badge variant="secondary">Custom Hours</Badge>
  );
};

const AvailabilitiesConfig = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] =
    useState<IAvailabilityOverride | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [clearPreviousData, setClearPreviousData] = useState(true); // clear previous data when adding a new availability override
  const { user } = useAuth();
  const canEdit = user?.permissions?.includes(
    `${PermissionType.APPOINTMENTS}.${PermissionSubType.EDIT}`,
  );
  const canView = user?.permissions?.includes(
    `${PermissionType.APPOINTMENTS}.${PermissionSubType.VIEW}`,
  );
  const canDelete = user?.permissions?.includes(
    `${PermissionType.APPOINTMENTS}.${PermissionSubType.DELETE}`,
  );
  const canAdd = user?.permissions?.includes(
    `${PermissionType.APPOINTMENTS}.${PermissionSubType.CREATE}`,
  );

  const {
    data: availabilities,
    isLoading: isLoadingAvailabilities,
    error: errorAvailabilities,
    refetch: refetchAvailabilities,
  } = useQuery({
    queryKey: ["availabilities"],
    queryFn: () => {
      if (!canView) {
        return Promise.reject(
          new Error("You don't have permission to view availabilities"),
        );
      }
      return getAvailabilitiesApi();
    },
  });

  const [formData, setFormData] = useState<IAvailabilityOverride>({
    date: new Date(),
    type: "CUSTOM",
    workingHours: {
      startTime: "09:00",
      endTime: "17:00",
    },
    reason: "",
    slots: {},
  });
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotMaxAppointments, setNewSlotMaxAppointments] = useState(1);
  const [newSlotIsBlocked, setNewSlotIsBlocked] = useState(false);

  // add new availability override
  const handleAddNew = () => {
    setFormData({
      date: new Date(),
      type: "CUSTOM",
      workingHours: {
        startTime: "",
        endTime: "",
      },
      reason: "",
      slots: {},
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  const { mutate: addAvailability, isPending: isAddingAvailability } =
    useMutation({
      mutationKey: ["addAvailability", clearPreviousData],
      mutationFn: ({
        availability,
        clearPreviousData,
      }: {
        availability: IAvailabilityOverride;
        clearPreviousData: boolean;
      }) => {
        if (!canAdd) {
          toast({
            title: "Error",
            description: "You don't have permission to add availabilities",
            variant: "destructive",
          });
          return;
        }
        return addAvailabilityApi(availability, clearPreviousData);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Availability override added successfully",
        });
        refetchAvailabilities();
        handleCancel();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    });

  // edit availability override
  const handleEdit = (availability: IAvailabilityOverride) => {
    setEditingAvailability(availability);
    setFormData({
      date: new Date(availability.date),
      type: availability.type,
      workingHours: availability.workingHours,
      reason: availability.reason,
      slots: availability.slots,
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const { mutate: updateAvailability, isPending: isUpdatingAvailability } =
    useMutation({
      mutationFn: (availability: IAvailabilityOverride) => {
        if (!canEdit) {
          toast({
            title: "Error",
            description: "You don't have permission to update availabilities",
            variant: "destructive",
          });
          return;
        }
        return updateAvailabilityApi(availability);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Availability override updated successfully",
        });
        refetchAvailabilities();
        handleCancel();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    });

  // handle delete availability override
  const { mutate: deleteAvailability, isPending: isDeletingAvailability } =
    useMutation({
      mutationFn: (availabilityId: string) => {
        if (!canDelete) {
          toast({
            title: "Error",
            description: "You don't have permission to delete availabilities",
            variant: "destructive",
          });
          return Promise.reject(
            new Error("You don't have permission to delete availabilities"),
          );
        }
        return deleteAvailabilityApi(availabilityId);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Availability override deleted successfully",
        });
        refetchAvailabilities();
        handleCancel();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    });

  const handleCancel = () => {
    setIsAddModalOpen(false);
    setEditingAvailability(null);
    setFormData({
      date: new Date(),
      type: "CUSTOM",
      workingHours: {
        startTime: "",
        endTime: "",
      },
      reason: "",
      slots: {},
    });
  };

  // individual slot management functions
  const addSlot = () => {
    if (!newSlotTime) {
      toast({
        title: "Error",
        description: "Please enter a time for the slot",
        variant: "destructive",
      });
      return;
    }

    // Check if slot already exists
    const existingSlot = formData.slots && newSlotTime in formData.slots;
    if (existingSlot) {
      toast({
        title: "Error",
        description: "A slot with this time already exists",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      slots: {
        ...prev.slots,
        [newSlotTime]: {
          isBlocked: newSlotIsBlocked,
          maxAppointments: newSlotIsBlocked ? 0 : newSlotMaxAppointments,
        },
      },
    }));

    // Reset form
    setNewSlotTime("");
    setNewSlotMaxAppointments(1);
    setNewSlotIsBlocked(false);

    toast({
      title: "Success",
      description: "Slot added successfully",
    });
  };

  const removeSlot = (timeToRemove: string) => {
    if (!formData.slots) return;

    const updatedSlots = { ...formData.slots };
    delete updatedSlots[timeToRemove];

    setFormData((prev) => ({
      ...prev,
      slots: updatedSlots,
    }));

    toast({
      title: "Success",
      description: "Slot removed successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Availability Overrides</h3>
          <p className="text-sm text-muted-foreground">
            Manage special dates, holidays, and custom working hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="clearPreviousData">Clear Previous Data</Label>
          <Switch
            checked={clearPreviousData}
            onCheckedChange={() => setClearPreviousData(!clearPreviousData)}
            id="clearPreviousData"
          />
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} disabled={!canAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Override
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing
                    ? "Edit Availability Override"
                    : "Add Availability Override"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={
                        formData.date
                          ? new Date(formData.date).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: new Date(e.target.value),
                        }))
                      }
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "HOLIDAY" | "CUSTOM") =>
                        setFormData((prev) => ({
                          ...prev,
                          type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOLIDAY">
                          Holiday (Closed)
                        </SelectItem>
                        <SelectItem value="CUSTOM">Custom Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Working Hours - only show if type is CUSTOM */}
                {formData.type === "CUSTOM" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.workingHours?.startTime || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours!,
                              startTime: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.workingHours?.endTime || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours!,
                              endTime: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter reason for this override..."
                    value={formData.reason || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Slot Management - only show if type is CUSTOM */}
                {formData.type === "CUSTOM" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Slot Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure individual time slots with specific rules
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add New Slot */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Add New Slot</h4>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <Label htmlFor="slotTime">Time</Label>
                            <Input
                              id="slotTime"
                              type="time"
                              value={newSlotTime}
                              onChange={(e) => setNewSlotTime(e.target.value)}
                              placeholder="10:00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="slotMaxAppointments">
                              Max Appointments
                            </Label>
                            <Input
                              id="slotMaxAppointments"
                              type="number"
                              min="0"
                              max="10"
                              value={newSlotMaxAppointments}
                              onChange={(e) =>
                                setNewSlotMaxAppointments(
                                  parseInt(e.target.value),
                                )
                              }
                              disabled={newSlotIsBlocked}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              checked={newSlotIsBlocked}
                              onCheckedChange={setNewSlotIsBlocked}
                            />
                            <Label>Blocked</Label>
                          </div>
                          <div className="pt-6">
                            <Button onClick={addSlot} size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Slot
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Current Slots */}
                      {formData.slots &&
                        Object.keys(formData.slots).length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Current Slots</h4>
                            <div className="space-y-2">
                              {Object.entries(formData.slots).map(
                                ([time, slotData], index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                          {time}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {slotData.isBlocked ? (
                                          <Badge variant="destructive">
                                            Blocked
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary">
                                            {slotData.maxAppointments} max
                                            appointments
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeSlot(time)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isAddingAvailability}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (isEditing) {
                        updateAvailability({
                          ...formData,
                          _id: editingAvailability?._id,
                        });
                      } else {
                        addAvailability({
                          availability: formData,
                          clearPreviousData,
                        });
                      }
                    }}
                    disabled={
                      isAddingAvailability || isUpdatingAvailability || !canAdd
                    }
                  >
                    {isAddingAvailability || isUpdatingAvailability ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      `${isEditing ? "Update" : "Add"} Override`
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Availabilities Table */}
      {isLoadingAvailabilities && !errorAvailabilities ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Overrides</CardTitle>
              <CardDescription>
                {availabilities?.length} availability override
                {availabilities?.length !== 1 ? "s" : ""} configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availabilities?.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No availability overrides
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first availability override to manage special dates
                    and custom hours.
                  </p>
                  <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Override
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Slots</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availabilities?.map((availability) => (
                      <TableRow key={availability._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(availability.date)}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(availability.type)}</TableCell>
                        <TableCell>
                          {availability.type === "HOLIDAY" ? (
                            <span className="text-muted-foreground">
                              Closed
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {availability.workingHours?.startTime} -{" "}
                              {availability.workingHours?.endTime}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <span className="text-sm text-muted-foreground">
                              {getSlotInfo(availability.slots)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {availability.reason || (
                            <span className="text-muted-foreground">
                              No reason provided
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(availability)}
                              disabled={isUpdatingAvailability || !canEdit}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteAvailability(availability._id!)
                              }
                              disabled={isDeletingAvailability || !canDelete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            About Availability Overrides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Holiday:</strong> Completely blocks the date for
              appointments. Use this for holidays, maintenance days, or when the
              business is closed.
            </p>
            <p>
              <strong>Custom Hours:</strong> Allows you to set different working
              hours for specific dates. Useful for half-days, special events, or
              modified schedules.
            </p>
            <p>
              <strong>Slots:</strong> Individual time slots can be configured
              with specific availability and appointment limits for fine-grained
              control.
            </p>
            <p>
              <strong>Clear Previous Data:</strong> When adding a new
              availability override, this will clear the previous data. which is
              less than today.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilitiesConfig;

function getErrorMessage(error: any): React.ReactNode {
  throw new Error("Function not implemented.");
}
