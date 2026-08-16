"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  getAddressViaPhone,
  getPickupByIdApi,
} from "@/services/modules/orders.api";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronUp, ChevronDown, X } from "lucide-react";
import { useRouter } from "@/lib/next-router-compat";

interface ExtraItem {
  name: string;
  unitCost: number;
  qty: number;
}

interface CheckoutFormData {
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  date?: string;
  time?: string;
  notes?: string;
  /** "Customer wants WhatsApp updates" — persisted against the order/customer. */
  whatsappOptIn?: boolean;

  advance_collected?: number;
  tax_percentage?: number;
  extra_items?: ExtraItem[];
}

interface CartCheckoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CheckoutFormData) => void;
  isSubmitting?: boolean;
}

export const CartCheckout: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formValues, setFormValues] = useState<CheckoutFormData>(() => ({
    phone: typeof window !== "undefined" ? localStorage.getItem("customerPhone") || "" : "",
    advance_collected: 0,
    extra_items: [],
    whatsappOptIn: true,
  }));

  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pickupId = localStorage.getItem("pickupId");
    const allowedKeys: (keyof CheckoutFormData)[] = [
      "name",
      "phone",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "date",
      "time",
    ];

    if (pickupId && isOpen) {
      setHydrating(true);
      getPickupByIdApi(pickupId)
        .then((pickup: any) => {
          const hydrated: any = {};

          allowedKeys.forEach((key) => {
            if (pickup[key] !== undefined) {
              hydrated[key] = pickup[key];
            }
          });
          hydrated["name"] = `${pickup.firstName} ${pickup.lastName || ""}`;

          setFormValues((prev) => ({
            ...prev,
            ...hydrated,
          }));
        })
        .finally(() => setHydrating(false));
      return;
    }

    const phone = localStorage.getItem("customerPhone");

    if (phone && isOpen) {
      setHydrating(true);
      getAddressViaPhone(phone)
        .then((address: any) => {
          if (address) {
            const hydrated: any = {};
            allowedKeys.forEach((key) => {
              if (address[key] !== undefined) {
                hydrated[key] = address[key];
              }
            });
            hydrated["name"] = `${address.firstName} ${address.lastName || ""}`;

            setFormValues((prev) => ({
              ...prev,
              ...hydrated,
            }));
          }
        })
        .finally(() => setHydrating(false));
    }
  }, [isOpen]);

  const handleChange = (id: keyof CheckoutFormData, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleExtraItemChange = (
    index: number,
    field: keyof ExtraItem,
    value: any,
  ) => {
    const updated = [...(formValues.extra_items || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("extra_items", updated);
  };

  const addExtraItem = () => {
    handleChange("extra_items", [
      ...(formValues.extra_items || []),
      { name: "", unitCost: 0, qty: 1 },
    ]);
  };

  const removeExtraItem = (index: number) => {
    const updated = [...(formValues.extra_items || [])];
    updated.splice(index, 1);
    handleChange("extra_items", updated);
  };

  const handleSave = () => {
    onSubmit?.(formValues);
  };

  const handleCancel = () => {
    setFormValues({});
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout Cart</DialogTitle>
          <DialogDescription>
            Please provide customer details to book order
          </DialogDescription>
        </DialogHeader>

        {hydrating ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formValues.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formValues.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  placeholder="Enter address line 1"
                  value={formValues.addressLine1 || ""}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  placeholder="Enter address line 2"
                  value={formValues.addressLine2 || ""}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={formValues.state || ""}
                    onChange={(e) => handleChange("state", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={formValues.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="Enter pincode"
                  value={formValues.pincode || ""}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  required
                />
              </div>

              {/* Appointment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Delivery Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formValues.date || ""}
                    onChange={(e) => handleChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formValues.time || ""}
                    onChange={(e) => handleChange("time", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Advance */}
              <div className="space-y-2">
                <Label htmlFor="advance">Advance Collected</Label>
                <Input
                  id="advance"
                  type="number"
                  placeholder="Enter amount"
                  value={formValues.advance_collected || 0}
                  onChange={(e) =>
                    handleChange("advance_collected", Number(e.target.value))
                  }
                />
              </div>

              {/* WhatsApp opt-in */}
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <Checkbox
                  id="whatsappOptIn"
                  checked={!!formValues.whatsappOptIn}
                  onCheckedChange={(checked) => handleChange("whatsappOptIn", !!checked)}
                  data-testid="whatsapp-optin-checkbox"
                />
                <Label htmlFor="whatsappOptIn" className="cursor-pointer font-normal">
                  Customer wants WhatsApp updates
                </Label>
              </div>

              {/* Extra Items */}
              <div className="space-y-3">
                <Label>Extra Items</Label>

                {(formValues.extra_items || []).map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-2 items-center"
                  >
                    <div className="space-y-1">
                      <Label>Item Name</Label>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          handleExtraItemChange(index, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Unit Cost</Label>
                      <Input
                        type="number"
                        placeholder="Unit Cost"
                        value={item.unitCost}
                        onChange={(e) =>
                          handleExtraItemChange(
                            index,
                            "unitCost",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) =>
                          handleExtraItemChange(
                            index,
                            "qty",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>

                    <Button
                      variant="destructive"
                      onClick={() => removeExtraItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button variant="secondary" onClick={addExtraItem}>
                  Add Extra Item
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const CartCheckoutForm: React.FC<Partial<CartCheckoutModalProps>> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [formValues, setFormValues] = useState<CheckoutFormData>(() => ({
    phone: typeof window !== "undefined" ? localStorage.getItem("customerPhone") || "" : "",
    advance_collected: 0,
    extra_items: [],
    notes: "",
    whatsappOptIn: true,
  }));

  const router = useRouter();
  const searchParams = router.query;
  const setSearchParams = (params: Record<string, string>) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...params,
      },
    });
  };

  const [hydrating, setHydrating] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  useEffect(() => {
    const allowedKeys: (keyof CheckoutFormData)[] = [
      "name",
      "phone",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "date",
      "time",
    ];

    const pickupId = searchParams.pickupId;
    if (pickupId) {
      setHydrating(true);
      getPickupByIdApi(pickupId)
        .then((pickup: any) => {
          const hydrated: any = {};
          allowedKeys.forEach((key) => {
            if (pickup[key] !== undefined) {
              hydrated[key] = pickup[key];
            }
          });
          hydrated["name"] = `${pickup.firstName} ${pickup.lastName || ""}`;
          setFormValues((prev) => ({ ...prev, ...hydrated }));
          setSearchParams({ _phone: pickup.phone });
        })
        .finally(() => setHydrating(false));
      return;
    }

    const phone = searchParams.phone;
    if (phone) {
      setFormValues({});
      setHydrating(true);
      getAddressViaPhone(phone)
        .then((address: any) => {
          if (address) {
            const hydrated: any = {};
            allowedKeys.forEach((key) => {
              if (address[key] !== undefined) {
                hydrated[key] = address[key];
              }
            });
            hydrated["name"] = `${address.firstName} ${address.lastName || ""}`;
            setFormValues((prev) => ({ ...prev, ...hydrated, phone }));
          }
        })
        .finally(() => setHydrating(false));
    }
  }, [searchParams]);

  const handleChange = (id: keyof CheckoutFormData, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleExtraItemChange = (
    index: number,
    field: keyof ExtraItem,
    value: any,
  ) => {
    const updated = [...(formValues.extra_items || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("extra_items", updated);
  };

  const addExtraItem = () => {
    handleChange("extra_items", [
      ...(formValues.extra_items || []),
      { name: "", unitCost: 0, qty: 1 },
    ]);
  };

  const removeExtraItem = (index: number) => {
    const updated = [...(formValues.extra_items || [])];
    updated.splice(index, 1);
    handleChange("extra_items", updated);
  };

  const handleSave = () => {
    console.log(formValues);
    onSubmit?.(formValues);
  };

  const handleCancel = () => {
    setFormValues({});
  };

  return (
    <div className="w-full p-6 border rounded-md relative">
      <h2 className="text-lg font-semibold">Checkout Cart</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Please provide customer details to book order
      </p>

      {hydrating ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 py-4 pb-20">
            {/* Customer Info */}
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formValues.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formValues.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                placeholder="Enter address line 1"
                value={formValues.addressLine1 || ""}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Enter address line 2"
                value={formValues.addressLine2 || ""}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={formValues.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formValues.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                placeholder="Enter pincode"
                value={formValues.pincode || ""}
                onChange={(e) => handleChange("pincode", e.target.value)}
                required
              />
            </div>

            {/* Appointment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Delivery Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formValues.date || ""}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formValues.time || ""}
                  onChange={(e) => handleChange("time", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Advance */}
            <div className="space-y-2">
              <Label htmlFor="advance">Advance Collected</Label>
              <Input
                id="advance"
                type="number"
                placeholder="Enter amount"
                value={formValues.advance_collected || 0}
                onChange={(e) =>
                  handleChange("advance_collected", Number(e.target.value))
                }
              />
            </div>

            {/* WhatsApp opt-in */}
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <Checkbox
                id="whatsappOptInForm"
                checked={!!formValues.whatsappOptIn}
                onCheckedChange={(checked) => handleChange("whatsappOptIn", !!checked)}
                data-testid="whatsapp-optin-checkbox-form"
              />
              <Label htmlFor="whatsappOptInForm" className="cursor-pointer font-normal">
                Customer wants WhatsApp updates
              </Label>
            </div>

            {/* Sticky Notes Section */}
            <div className="fixed bottom-4 right-4 z-50 md:bottom-2 md:right-2 md:left-2">
              <AnimatePresence>
                {!isNotesExpanded ? (
                  <motion.button
                    layoutId="notes-container"
                    onClick={() => setIsNotesExpanded(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0 }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formValues.notes ? "Edit Notes" : "Add Notes"}
                    </span>
                    {formValues.notes && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </motion.button>
                ) : (
                  <motion.div
                    layoutId="notes-container"
                    className="bg-white border rounded-xl shadow-xl overflow-hidden min-w-[300px] max-w-[calc(100vw-2rem)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0 }}
                  >
                    <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <Label
                          htmlFor="notes"
                          className="font-semibold cursor-default"
                        >
                          Order Notes
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsNotesExpanded(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <Textarea
                        id="notes"
                        placeholder="Enter notes related to order..."
                        className="min-h-[100px] resize-none focus-visible:ring-1"
                        value={formValues.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Extra Items */}
            <div className="space-y-3">
              <Label>Extra Items</Label>

              {(formValues.extra_items || []).map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 items-center"
                >
                  <div className="space-y-1">
                    <Label>Item Name</Label>
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        handleExtraItemChange(index, "name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Unit Cost</Label>
                    <Input
                      type="number"
                      placeholder="Unit Cost"
                      value={item.unitCost}
                      onChange={(e) =>
                        handleExtraItemChange(
                          index,
                          "unitCost",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) =>
                        handleExtraItemChange(
                          index,
                          "qty",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => removeExtraItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button variant="secondary" onClick={addExtraItem}>
                Add Extra Item
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
