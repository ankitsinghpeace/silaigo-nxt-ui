"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "./AdminLayout";
import {
  getPickupApi,
  updatePickupOptionsApi,
} from "@/services/modules/orders.api";
import { format, parseISO } from "date-fns";
import OrderTimelineView from "../OrderTImeLineView";
import { Table, TableHead, TableRow, TableCell } from "../ui/table";
import Swal from "sweetalert2";
import { updatePickupDetailsApi } from "@/services/modules/orders.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function parsePickupDateAndMinutes(pickup: any): { dateTimestamp: number; timeMinutes: number } {
  if (!pickup) return { dateTimestamp: 0, timeMinutes: 0 };

  const rawDate = pickup.scheduledPickupDate;
  let datePart = "";
  if (typeof rawDate === "string") {
    datePart = rawDate.split("T")[0];
  } else if (rawDate instanceof Date) {
    datePart = rawDate.toISOString().split("T")[0];
  }

  let dateTimestamp = 0;
  if (datePart) {
    const d = new Date(`${datePart}T00:00:00`);
    if (!isNaN(d.getTime())) {
      dateTimestamp = d.getTime();
    }
  } else if (pickup.createdAt) {
    const d = new Date(pickup.createdAt);
    if (!isNaN(d.getTime())) {
      dateTimestamp = new Date(d.toISOString().split("T")[0] + "T00:00:00").getTime();
    }
  }

  let timePart = pickup.scheduledPickupTime || "00:00";
  if (typeof timePart === "string" && timePart.includes("-")) {
    timePart = timePart.split("-")[0].trim();
  }

  let hours = 0;
  let minutes = 0;

  if (typeof timePart === "string") {
    const isPM = /pm/i.test(timePart);
    const isAM = /am/i.test(timePart);
    const cleanTime = timePart.replace(/[^0-9:]/g, "");
    const parts = cleanTime.split(":");
    if (parts.length >= 1) {
      hours = parseInt(parts[0], 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }
    if (parts.length >= 2) {
      minutes = parseInt(parts[1], 10) || 0;
    }
  }

  const timeMinutes = hours * 60 + minutes;
  return { dateTimestamp, timeMinutes };
}

export default function PickupsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingPickup, setEditingPickup] = React.useState<any>(null);
  const [editValues, setEditValues] = React.useState<any>({});

  const { data: pickups = [], isLoading } = useQuery({
    queryKey: ["pickups"],
    queryFn: getPickupApi,
  });

  const mutation = useMutation({
    mutationFn: ({ id, options }: { id: string; options: any[] }) =>
      updatePickupOptionsApi(id, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pickups"] });
      toast({ title: "Pickup updated successfully" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updatePickupDetailsApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pickups"] });
      toast({ title: "Pickup details updated" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  const filteredPickups = React.useMemo(() => {
    if (!pickups || !Array.isArray(pickups)) return [];
    let localCreatedIds: string[] = [];
    if (typeof window !== "undefined") {
      try {
        localCreatedIds = JSON.parse(
          localStorage.getItem("createdOrderPickupIds") || "[]",
        );
      } catch (e) { }
    }

    const filtered = pickups.filter((pickup: any) => {
      if (localCreatedIds.includes(pickup._id)) {
        return false;
      }

      if (
        pickup.orderCreated === true ||
        pickup.isOrderCreated === true ||
        pickup.isConvertedToOrder === true ||
        pickup.isConverted === true ||
        pickup.hasOrder === true ||
        Boolean(pickup.orderId) ||
        Boolean(pickup.order) ||
        pickup.status === "ORDER_CREATED" ||
        pickup.status === "CONVERTED" ||
        pickup.status === "COMPLETED" ||
        pickup.status === "FULFILLED"
      ) {
        return false;
      }

      if (Array.isArray(pickup.options) && pickup.options.length > 0) {
        const lastOption = pickup.options[pickup.options.length - 1];
        if (lastOption?.value === true) {
          return false;
        }
      }

      return true;
    });

    return filtered.sort((a: any, b: any) => {
      const pA = parsePickupDateAndMinutes(a);
      const pB = parsePickupDateAndMinutes(b);

      // 1. Date DESCENDING (latest date first)
      if (pA.dateTimestamp !== pB.dateTimestamp) {
        return pB.dateTimestamp - pA.dateTimestamp;
      }

      // 2. Time ASCENDING (earliest time first for the same date)
      return pA.timeMinutes - pB.timeMinutes;
    });
  }, [pickups]);

  function handleCheckboxChange(
    pickupId: string,
    label: string,
    value: boolean,
  ) {
    queryClient.setQueryData(["pickups"], (old: any[]) =>
      old.map((p) => {
        if (p._id !== pickupId) return p;

        const index = p.options.findIndex((o: any) => o.label === label);

        const isLast = index === p.options.length - 1;

        if (value && isLast) {
          const confirmed = window.confirm(
            "Are you sure you want to mark this pickup as completed?",
          );

          if (!confirmed) return p;
        }

        return {
          ...p,
          options: p.options.map((o: any, i: number) => {
            if (value) {
              return i <= index ? { ...o, value: true } : o;
            } else {
              return i <= index ? { ...o, value: false } : o;
            }
          }),
        };
      }),
    );
  }

  function handleUpdate(pickup: any) {
    mutation.mutate({
      id: pickup._id,
      options: pickup.options.map((o: any) => ({
        label: o.label,
        value: o.value,
      })),
    });
  }

  function openEditDialog(pickup: any) {
    setEditingPickup(pickup);
    setEditValues({
      firstName: pickup.firstName || "",
      phone: pickup.phone || "",
      pickupFor: pickup.pickupFor || "",
      scheduledPickupDate: pickup.scheduledPickupDate || "",
      scheduledPickupTime: pickup.scheduledPickupTime || "",
      addressLine1: pickup.addressLine1 || "",
      addressLine2: pickup.addressLine2 || "",
      city: pickup.city || "",
      state: pickup.state || "",
      pincode: pickup.pincode || "",
    });
    setEditOpen(true);
  }

  function submitEdit() {
    if (!editingPickup) return;

    editMutation.mutate({
      id: editingPickup._id,
      payload: editValues,
    });

    setEditOpen(false);
    setEditingPickup(null);
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Pickups List</h2>

      {isLoading ? (
        <div className="flex justify-center py-10 text-muted-foreground">
          Loading pickups...
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <thead className="bg-muted">
                <TableRow>
                  <TableHead className="p-3 text-left">Customer</TableHead>
                  <TableHead className="p-3 text-left">Phone</TableHead>
                  <TableHead className="p-3 text-left">Address</TableHead>
                  <TableHead className="p-3 text-left">Pickup For</TableHead>
                  <TableHead className="p-3 text-left">
                    Pickup date & time
                  </TableHead>
                  {/* <TableHead className="p-3 text-left">Status</TableHead> */}
                  <TableHead className="p-3 text-left">Action</TableHead>
                </TableRow>
              </thead>

              <tbody>
                {filteredPickups.length > 0 ? (
                  filteredPickups.map((pickup: any) => (
                    <React.Fragment key={pickup._id}>
                      <TableRow className="align-top border-b-0">
                        <TableCell className="p-3 align-top">
                          {pickup.firstName}
                        </TableCell>

                        <TableCell className="p-3 align-top">
                          {pickup.phone || "-"}
                        </TableCell>

                        <TableCell className="p-3 align-top max-w-xs">
                          {[
                            pickup.addressLine1,
                            pickup.addressLine2,
                            pickup.city,
                            pickup.state,
                            pickup.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </TableCell>

                        <TableCell className="p-3 align-top">
                          {pickup.pickupFor}
                        </TableCell>

                        <TableCell className="p-3 align-top">
                          {pickup.scheduledPickupDate ? (
                            <div>
                              <div className="font-medium">
                                {format(
                                  parseISO(
                                    `${pickup.scheduledPickupDate}T00:00:00`,
                                  ),
                                  "MMM dd, yyyy",
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {pickup.scheduledPickupTime}
                              </div>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>

                        <TableCell className="align-top flex gap-2 items-center">
                          <Link
                            href={`/admin/create-order?pickupId=${pickup._id}`}
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                localStorage.setItem("pickupId", pickup._id);
                              }
                            }}
                          >
                            <Button>Create Order</Button>
                          </Link>

                          <Button onClick={() => openEditDialog(pickup)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7}>
                          {" "}
                          <OrderTimelineView
                            timeline={pickup?.timeline || []}
                          />
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No active pickups found.
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pickup Details</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Customer Name</Label>
              <Input
                value={editValues.firstName}
                onChange={(e) =>
                  setEditValues({ ...editValues, firstName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={editValues.phone}
                onChange={(e) =>
                  setEditValues({ ...editValues, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Pickup For</Label>
              <Input
                value={editValues.pickupFor}
                onChange={(e) =>
                  setEditValues({ ...editValues, pickupFor: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editValues.scheduledPickupDate}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      scheduledPickupDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Time</Label>
                <Input
                  value={editValues.scheduledPickupTime}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      scheduledPickupTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Address Line 1</Label>
              <Input
                value={editValues.addressLine1}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    addressLine1: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Address Line 2</Label>
              <Input
                value={editValues.addressLine2}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    addressLine2: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="City"
                value={editValues.city}
                onChange={(e) =>
                  setEditValues({ ...editValues, city: e.target.value })
                }
              />
              <Input
                placeholder="State"
                value={editValues.state}
                onChange={(e) =>
                  setEditValues({ ...editValues, state: e.target.value })
                }
              />
              <Input
                placeholder="Pincode"
                value={editValues.pincode}
                onChange={(e) =>
                  setEditValues({ ...editValues, pincode: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={editMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
