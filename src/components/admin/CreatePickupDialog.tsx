'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

import { CreatePickupPayload } from '@/types/interface';
import { createPickupApi } from '@/services/modules/orders.api';

interface Prefill {
        firstName: string,
        lastName:string,
        phone : string
        addressLine1 : string,
        addressLine2 : string,
        city : string,
        state : string,
        pincode : string
}

export function CreatePickupDialog({prefill}: {prefill?: Prefill}) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);

    const [form, setForm] = React.useState<CreatePickupPayload>({
        firstName: prefill?.firstName || '',
        lastName: prefill?.lastName || '',
        phone: prefill?.phone || '',
        addressLine1: prefill?.addressLine1 || '',
        addressLine2: prefill?.addressLine2 || '',
        city: prefill?.city || '',
        state: prefill?.state || '',
        pincode: prefill?.pincode || '',
    });

    const mutation = useMutation({
        mutationFn: createPickupApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pickups'] });
            toast({
                title: 'Pickup created',
                description: 'The pickup has been scheduled successfully.',
            });
            setOpen(false);
            setForm({ firstName: '' });
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to create pickup',
                description:
                    error?.message || 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        },
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.phone || !form.firstName || !form.scheduledPickupDate || !form.scheduledPickupTime) {
            toast({
                description: "Phone,name, pickup date and time is required",
                variant: "destructive"
            });
            return
        }
        mutation.mutate(form);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="btn-primary p-2 text-center">
                Create Pickup
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto flex flex-col pickupDialogScrollbar p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Create Pickup</DialogTitle>
                    <DialogDescription>
                        Enter pickup details and schedule the pickup.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6">
                    <form className="grid gap-4 py-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="firstName">First name *</Label>
                            <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input id="lastName" name="lastName" value={form.lastName || ''} onChange={handleChange} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" value={form.phone || ''} onChange={handleChange} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="pickupFor">Pickup for</Label>
                            <Input id="pickupFor" name="pickupFor" value={form.pickupFor || ''} onChange={handleChange} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="addressLine1">Address line 1</Label>
                            <Input id="addressLine1" name="addressLine1" value={form.addressLine1 || ''} onChange={handleChange} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="addressLine2">Address line 2</Label>
                            <Input id="addressLine2" name="addressLine2" value={form.addressLine2 || ''} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" value={form.city || ''} onChange={handleChange} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" name="state" value={form.state || ''} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" name="pincode" value={form.pincode || ''} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="scheduledPickupDate">Pickup date</Label>
                                <Input id="scheduledPickupDate" type="date" name="scheduledPickupDate" value={form.scheduledPickupDate || ''} onChange={handleChange} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="scheduledPickupTime">Pickup time</Label>
                                <Input id="scheduledPickupTime" type="time" name="scheduledPickupTime" value={form.scheduledPickupTime || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="px-6 pb-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="btn-primary w-full sm:w-auto"
                    >
                        {mutation.isPending ? 'Creating...' : 'Create Pickup'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
