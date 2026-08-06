"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, MapPin, Home, Building2 } from "lucide-react";
import {
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
} from "@/services/modules/profile.api";
import { IAddress } from "@/types/interface";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";

interface AddressSelectorProps {
  onSelect: (address: IAddress) => void;
  selectedAddressId?: string;
  impersonateUserId?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  onSelect,
  selectedAddressId,
  impersonateUserId,
}) => {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<IAddress, "_id">>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsInitialLoading(true);
        const addresses = await getAddress();
        const defaultSelectedAddress = addresses.filter((address) => {
          return address.isDefault;
        });
        const selectedAddress =
          defaultSelectedAddress.length > 0
            ? defaultSelectedAddress[0]
            : addresses[0]
            ? addresses[0]
            : null;
        onSelect(selectedAddress);
        setAddresses(addresses);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load addresses",
          variant: "destructive",
        });
        setAddresses([]);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchAddresses();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const resetForm = () => {
    setFormData({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingAddress) {
        const updatedAddress = await updateAddress(
          editingAddress._id,
          formData
        );
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddress._id ? updatedAddress : addr
          )
        );
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
        setIsDialogOpen(false);
        resetForm();
      } else {
        const newAddress = await addAddress({ ...formData, impersonateUserId });
        setAddresses((prev) => [...prev, newAddress]);
        toast({ title: "Success", description: "Address added successfully" });
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      const err = generateErrorMessage(error);
      toast({
        title: "Error",
        description: err || "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (address: IAddress) => {
    setEditingAddress(address);
    setFormData({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (_id: string) => {
    try {
      await deleteAddress(_id);
      setAddresses((prev) => prev.filter((addr) => addr._id !== _id));
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      const err = generateErrorMessage(error);
      toast({
        title: "Error",
        description: err || "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold">Select Delivery Address</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Add Address"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isInitialLoading ? (
          <div>Loading...</div>
        ) : addresses.length === 0 ? (
          <div className="col-span-2">
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No Addresses Found</h3>
                  <p className="text-muted-foreground">
                    Add your first address to get started with deliveries
                  </p>
                </div>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add New Address
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          addresses.map((address) => (
            <Card
              key={address._id}
              className={`p-4 hover:shadow-lg transition-shadow duration-200 flex flex-col cursor-pointer ${
                selectedAddressId === address._id
                  ? "border-primary border-2 bg-primary/5"
                  : ""
              }`}
              onClick={() => onSelect(address)}
            >
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <Home className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">
                        {address.addressLine1}
                      </h3>
                    </div>
                    {address.addressLine2 && (
                      <p className="text-muted-foreground text-sm">
                        {address.addressLine2}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1 pl-8 mt-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {address.city}, {address.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Pincode: {address.pincode}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                {address.isDefault && (
                  <span className="inline-block bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    disabled={isLoading}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address._id);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressSelector;
