"use client";

import { useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchAllCategories, fetchSubCategoryData } from "@/services";
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
import { useToast } from "@/hooks/use-toast";
import { addCustomizationsApi } from "@/services/modules/orders.api";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess: () => void;
}

export default function UpdateOrderOptions({
  onOpenChange,
  isOpen,
  orderId,
  onSuccess,
}: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedOptions, setSelectedOptions] = useState<
    { categoryId: string; optionId: string }[]
  >([]);
  const [selectedSubCategoryStyleId, setSelectedSubCategoryStyleId] =
    useState("");

  const {
    data: categories,
    isPending: loadingCategories,
    error: categoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await fetchAllCategories(),
  });

  const {
    data: subCategories,
    isPending: loadingSubCategories,
    error: subCategoryError,
  } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: async () => await fetchSubCategoryData(selectedCategoryId),
    enabled: selectedCategoryId ? true : false,
  });

  const { toast } = useToast();

  const { mutate: updateOrderOptions, isPending: isUpdating } = useMutation({
    mutationKey: [JSON.stringify(selectedOptions), orderId],
    mutationFn: async () => {
      const newPrice = prompt("Enter new Price (optional): ");
      const data = await addCustomizationsApi({
        orderId,
        customizations: [],
        ...(Number(newPrice) > 0 && { customPrice: Number(newPrice) }),
        options: selectedOptions,
        subCategoryId: subCategories?.subCategoryId,
        subCategoryStyleId: selectedSubCategoryStyleId,
      });
      return data;
    },
    onSuccess: () => {
      toast({ description: "Options updated successfully" });
      setSelectedCategoryId(null);
      setSelectedOptions([]);
      setSelectedSubCategoryStyleId("");
      onSuccess();
    },
    onError: (err) => {
      toast({ description: generateErrorMessage(err) });
    },
  });

  const handleToggleOption = (categoryId: string, optionId: string) => {
    const exists = selectedOptions.some(
      (item) => item.categoryId === categoryId && item.optionId === optionId,
    );

    if (exists) {
      setSelectedOptions((prev) =>
        prev.filter(
          (item) =>
            !(item.categoryId === categoryId && item.optionId === optionId),
        ),
      );
    } else {
      setSelectedOptions((prev) => [...prev, { categoryId, optionId }]);
    }
  };

  if (loadingCategories) return <p className="text-center">Loading...</p>;
  if (categoryError)
    return (
      <p className="text-red-500 text-center">
        {generateErrorMessage(categoryError)}
      </p>
    );

  const selectedCategory = categories?.find(
    (c: any) => c.id === selectedCategoryId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Tailoring Details</DialogTitle>
          <DialogDescription>
            Manage tailoring and body measurements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Select */}
          <select
            value={selectedCategoryId || ""}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              Select a Category
            </option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <p>Style Options</p>
          {/* Options Grid */}
          {selectedCategory && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {selectedCategory.options.map((option: any) => {
                const isSelected = selectedOptions.some(
                  (item) =>
                    item.categoryId === selectedCategory._id &&
                    item.optionId === option._id,
                );

                return (
                  <div
                    key={option._id}
                    onClick={() =>
                      handleToggleOption(selectedCategory._id, option._id)
                    }
                    className={`p-3 rounded-md transition-all border flex flex-col items-center text-center cursor-pointer
                                          ${
                                            isSelected
                                              ? "ring-2 ring-primary bg-primary/10 border-primary"
                                              : "hover:shadow-sm border-gray-200 bg-white hover:scale-[1.01]"
                                          }`}
                  >
                    <div className="text-sm font-medium line-clamp-2">
                      {option.title}
                    </div>
                    <div className="text-xs mt-1">
                      {option.price !== option.discountedPrice ? (
                        <>
                          <span className="line-through text-gray-400">
                            ₹{option.price}
                          </span>{" "}
                          <span className="text-primary font-semibold">
                            ₹{option.discountedPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-primary font-semibold">
                          ₹{option.price}
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-2 p-1 rounded-full border ${
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
          )}

          <p>Subcategories Options</p>
          {/* SUbcategory Styles Options Grid */}
          {subCategories && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {subCategories.styles.map((option: any) => {
                const isSelected = subCategories.styles.some(
                  (item) =>
                    item._id === selectedSubCategoryStyleId &&
                    option._id === selectedSubCategoryStyleId,
                );

                return (
                  <div
                    key={option._id}
                    onClick={() => {
                      setSelectedSubCategoryStyleId(option._id);
                    }}
                    className={`p-3 rounded-md transition-all border flex flex-col items-center text-center cursor-pointer
                                          ${
                                            isSelected
                                              ? "ring-2 ring-primary bg-primary/10 border-primary"
                                              : "hover:shadow-sm border-gray-200 bg-white hover:scale-[1.01]"
                                          }`}
                  >
                    <div className="text-sm font-medium line-clamp-2">
                      {option.name}
                    </div>
                    <div className="text-xs mt-1">
                      {option.price !== option.discountedPrice ? (
                        <>
                          <span className="line-through text-gray-400">
                            ₹{option.price}
                          </span>{" "}
                          <span className="text-primary font-semibold">
                            ₹{option.discountedPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-primary font-semibold">
                          ₹{option.price}
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-2 p-1 rounded-full border ${
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
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isUpdating} onClick={() => updateOrderOptions()}>
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
