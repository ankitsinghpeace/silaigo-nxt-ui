'use client';

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText } from "lucide-react";

interface ExtraItem {
    name: string;
    unitCost: number;
    qty: number;
}

interface InvoiceFormData {
    name?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    date?: string;
    time?: string;
    advance_collected?: number;
    tax_percentage?: number;
    extra_items?: ExtraItem[];
}

interface InvoiceGeneratorDialogProps {
    initialData?: Partial<InvoiceFormData>;
    onSubmit?: (data: InvoiceFormData) => void;
    isSubmitting?: boolean;
}

export const InvoiceGeneratorDialog: React.FC<InvoiceGeneratorDialogProps> = ({
    initialData,
    onSubmit,
    isSubmitting = false,
}) => {
    const [open, setOpen] = useState(false);
    const [hydrating, setHydrating] = useState(false);

    const [formValues, setFormValues] = useState<InvoiceFormData>({
        advance_collected: 0,
        extra_items: [],
    });

    /** 🔄 Hydrate when dialog opens */
    useEffect(() => {
        if (!open || !initialData) return;

        setHydrating(true);

        setFormValues((prev) => ({
            ...prev,
            ...initialData,
            extra_items: initialData.extra_items || [],
        }));

        setHydrating(false);
    }, [open, initialData]);

    const handleChange = (key: keyof InvoiceFormData, value: any) => {
        setFormValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleExtraItemChange = (
        index: number,
        field: keyof ExtraItem,
        value: any
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" title="Generate Invoice">
                    <FileText className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Invoice Generator</DialogTitle>
                    <DialogDescription>
                        Generate and update invoice details for this order
                    </DialogDescription>
                </DialogHeader>

                {hydrating ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 py-4">
                            {/* Customer */}
                            <div className="space-y-2">
                                <Label>Customer Name</Label>
                                <Input
                                    value={formValues.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={formValues.phone || ""}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label>Address Line 1</Label>
                                <Input
                                    value={formValues.addressLine1 || ""}
                                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Address Line 2</Label>
                                <Input
                                    value={formValues.addressLine2 || ""}
                                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>City</Label>
                                    <Input
                                        value={formValues.city || ""}
                                        onChange={(e) => handleChange("city", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>State</Label>
                                    <Input
                                        value={formValues.state || ""}
                                        onChange={(e) => handleChange("state", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Pincode</Label>
                                <Input
                                    value={formValues.pincode || ""}
                                    onChange={(e) => handleChange("pincode", e.target.value)}
                                />
                            </div>

                            {/* Advance */}
                            <div className="space-y-2">
                                <Label>Advance Collected</Label>
                                <Input
                                    type="number"
                                    value={formValues.advance_collected || 0}
                                    onChange={(e) =>
                                        handleChange("advance_collected", Number(e.target.value))
                                    }
                                />
                            </div>

                            {/* Extra Items */}
                            <div className="space-y-3">
                                <Label>Extra Items</Label>

                                {(formValues.extra_items || []).map((item, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-2 items-end">
                                        <div>
                                            <Label>Name</Label>
                                            <Input
                                                placeholder="Item"
                                                value={item.name}
                                                onChange={(e) =>
                                                    handleExtraItemChange(index, "name", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label>Price</Label>
                                            <Input
                                                type="number"
                                                placeholder="Cost"
                                                value={item.unitCost}
                                                onChange={(e) =>
                                                    handleExtraItemChange(
                                                        index,
                                                        "unitCost",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label>Qty.</Label>
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.qty}
                                                onChange={(e) =>
                                                    handleExtraItemChange(
                                                        index,
                                                        "qty",
                                                        Number(e.target.value)
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
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving
                                    </>
                                ) : (
                                    "Save Invoice"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
