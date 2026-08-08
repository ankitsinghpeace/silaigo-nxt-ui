"use client";

import { useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import PlaceholderImage from "@/assets/custome-design-image-placeholder.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchAllCategories, getCustomizationData } from "@/services";
import { generateErrorMessage } from "@/lib/helpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { addCustomizationsApi } from "@/services/modules/orders.api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess: () => void;
}

export default function UpdateOrderCustomizations({
  onOpenChange,
  isOpen,
  orderId,
  onSuccess,
}: Props) {
  const [selectedItems, setSelectedItems] = useState([]);
  const { data, isPending, error } = useQuery({
    queryKey: ["customizations"],
    queryFn: async () => {
      const data = getCustomizationData();
      return data;
    },
  });
  const {
    data: categoreis,
    isPending: loadingCategories,
    error: categoryLoadingError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await fetchAllCategories();
      return data;
    },
  });

  const { toast } = useToast();

  const { mutate: updateOrderCustomizations, isPending: isUpdating } =
    useMutation({
      mutationKey: [JSON.stringify(selectedItems), orderId],
      mutationFn: async () => {
        const newPrice = prompt("Enter new Price (optional): ");
        const data = await addCustomizationsApi({
          orderId,
          customizations: selectedItems,
          ...(Number(newPrice) > 0 && { customPrice: Number(newPrice) }),
          options: [],
        });
        return data;
      },
      onSuccess: () => {
        toast({ description: "Customizations updated successfully" });
        onSuccess();
      },
      onError: (err) => {
        toast({ description: generateErrorMessage(err) });
      },
    });

  const handleSelect = (categoryType, optionId) => {
    const exists = selectedItems.some(
      (item) => item.type === categoryType && item.optionId === optionId,
    );

    if (exists) {
      setSelectedItems((prev) =>
        prev.filter(
          (item) => !(item.type === categoryType && item.optionId === optionId),
        ),
      );
    } else {
      setSelectedItems((prev) => [...prev, { type: categoryType, optionId }]);
    }
  };

  if (isPending || loadingCategories) {
    return <p className="text-center">Loading...</p>;
  }

  if (error || categoryLoadingError) {
    return (
      <p className="text-red text-center">
        {generateErrorMessage(error) ||
          generateErrorMessage(categoryLoadingError)}
      </p>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Tailoring Details</DialogTitle>
          <DialogDescription>
            Manage tailoring and body measurements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {data.map((category) => (
            <div key={category._id}>
              <h2 className="text-lg font-semibold mb-2">{category.type}</h2>

              <div className="grid grid-cols-3 gap-3">
                {category.options.map((design) => {
                  const isSelected = selectedItems.some(
                    (item) =>
                      item.type === category.type &&
                      item.optionId === design._id,
                  );

                  return (
                    <div
                      key={design._id}
                      onClick={() => handleSelect(category.type, design._id)}
                      className={`p-2 rounded-md transition-all border flex flex-col items-center text-center cursor-pointer
                    ${
                      isSelected
                        ? "ring-2 ring-primary bg-primary/10 border-primary"
                        : "hover:shadow-sm border-gray-200 bg-white hover:scale-[1.01]"
                    }
                  `}
                    >
                      <div className="aspect-square bg-gray-100 w-full overflow-hidden rounded-sm">
                        <img
                          src={
                            !design.imageUrl || design.imageUrl === ""
                              ? PlaceholderImage
                              : design.imageUrl
                          }
                          alt={design.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-xs font-medium mt-1 line-clamp-2 px-1">
                        {design.title}
                      </div>
                      <div className="text-xs mt-1">
                        {design.price !== design.discountedPrice ? (
                          <>
                            <span className="line-through text-gray-400">
                              ₹{design.price}
                            </span>{" "}
                            <span className="text-primary font-semibold">
                              ₹{design.discountedPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-primary font-semibold">
                            ₹{design.price}
                          </span>
                        )}
                      </div>
                      <div
                        className={`mt-1 p-1 rounded-full border ${
                          isSelected
                            ? "text-red-500 border-red-300 hover:bg-red-50"
                            : "text-primary border-primary hover:bg-primary/10"
                        }`}
                      >
                        {isSelected ? (
                          <Minus className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => {
              updateOrderCustomizations();
            }}
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
