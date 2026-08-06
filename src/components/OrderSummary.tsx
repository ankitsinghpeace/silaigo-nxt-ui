import {
  Camera,
  Phone,
  X,
  Trash2,
  Loader2,
  Info,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import React, { useEffect } from "react";
import MultiImageBookingModal from "./MultiImageBookingModal";
import { useToast } from "@/hooks/use-toast";
import { getSubCategoryStyleDetails } from "@/services/modules/category.api";
import { useQuery } from "@tanstack/react-query";
import { useOrderFlow } from "@/contexts/OrderFlowContext";
import { NOT_LOGGED_IN_STEPS } from "@/contexts/OrderFlowContext";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services";
import { MeasurementsModal } from "./admin/modals/MeasurementsModal";
import { useRouter } from "@/lib/next-router-compat";

export const ORDER_DATA_KEY = "orderData";

interface CustomizationDesign {
  [x: string]: any;
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  category: string;
  type: string;
  discountedPrice?: number;
}

interface OrderSummaryProps {
  onOrderPlaced?: () => void;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showSidebar: boolean;
}

export const getTotalCustomizationPrice = (
  customizations: CustomizationDesign[],
  selectedOption: any,
) => {
  let customizationPrice: number = customizations.reduce(
    (sum, d) =>
      sum + (d.discountedPrice >= 0 ? d.discountedPrice : d.price || 0),
    0,
  );

  if (selectedOption) {
    for (let i = 0; i < selectedOption.length; i++) {
      customizationPrice +=
        selectedOption[i]?.discountedPrice >= 0
          ? Number(selectedOption[i]?.discountedPrice)
          : Number(selectedOption[i]?.price) || 0;
    }
  }

  return customizationPrice;
};

const OrderSummary = ({
  onOrderPlaced,
  showSidebar,
  setShowSidebar,
}: OrderSummaryProps) => {
  const {
    selectedCustomizations,
    setSelectedCustomizations,
    selectedOption,
    setSelectedOption,
    isPlacingOrder,
    orderType,
    handleLoginForScheduleCall,
    currentStepType,
    uplaodedImageUrls,
    handleScheduleCallClick,
    placeOrderWithCustomization,
    addOrderDataToCart,
    isMeasurementModalOpen,
    setIsMeasurementModalOpen,
  } = useOrderFlow();
  const { user } = useAuth();

  const router = useRouter();

  const searchParams = router.query;
  const subCatId = router.query.subCatId;
  const { id: catId, styleId } = useRouter().query;
  const totalCustomizationPrice = getTotalCustomizationPrice(
    selectedCustomizations,
    selectedOption,
  );
  const navigate = useRouter();
  const { toast } = useToast();

  const {
    data: subCategoryStyleDetails,
    isLoading: isSubCategoryStyleDetailsLoading,
  } = useQuery({
    queryKey: ["subCategoryStyleDetails", subCatId, styleId],
    queryFn: () => getSubCategoryStyleDetails(subCatId, styleId),
    enabled: Boolean(subCatId) && Boolean(styleId),
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const handleRemoveCustomization = (id: string) => {
    setSelectedCustomizations((prev) => prev.filter((d) => d._id !== id));
  };

  const handleOptionChange = (option: any) => {
    const isAlreadyPresent = selectedOption.filter((el) => {
      return el._id === option._id;
    });

    if (isAlreadyPresent.length > 0) {
      setSelectedOption((prev) => {
        return prev.filter((el) => {
          return el._id !== option._id;
        });
      });
    } else {
      setSelectedOption([...selectedOption, option]);
    }
  };

  const handleAddToCart = async (measurement) => {
    setIsMeasurementModalOpen(false);
    const customerDetails = await Swal.fire({
      title:
        '<h2 style="font-size:20px; font-weight:600; margin-bottom:4px;">Enter Details</h2>',
      html: `
    <div style="text-align:left; font-size:14px; display:flex; flex-direction:column; gap:14px; zindex:999;">
      <div>
        <label style="display:block; margin-bottom:4px; font-weight:500;">Custom Price (optional)</label>
        <input id="swal-price" class="swal2-input" placeholder="Custom Price (optional)" type="number" style="width:100%; margin:0;" />
      </div>
    </div>
  `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          price:
            (document.getElementById("swal-price") as HTMLInputElement).value ||
            null,
        };
      },
      confirmButtonText: "Save",
      showCancelButton: false,
      customClass: {
        popup: "rounded-xl shadow-md",
        confirmButton: "bg-teal-600 text-white px-4 py-2 rounded-lg",
        cancelButton: "bg-gray-200 text-gray-800 px-4 py-2 rounded-lg ml-2",
      },
    });

    const { price } = customerDetails.value;

    const cartItem = {
      customizations: selectedCustomizations,
      subcategoryStyleId: styleId,
      imageUrls: uplaodedImageUrls || [],
      returnUrl: window.location.href,
      name: subCategoryStyleDetails?.name,
      price: totalCustomizationPrice + subCategoryStyleDetails?.discountedPrice,
      productImage: subCategoryStyleDetails?.image,
    };
    toast({
      title: "Success",
      description: "successfully added to cart",
      variant: "default",
    });

    await addOrderDataToCart(cartItem, price, measurement);
    router.push("/tailoring");
  };

  const OrderSummaryContent = () => (
    <div className="flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Order</h2>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {subCategoryStyleDetails?.name}
            </span>
            <span>₹{subCategoryStyleDetails?.discountedPrice}</span>
          </div>

          <div className="flex flex-col gap-3">
            {subCategoryStyleDetails?.category?.options?.map(
              (option, index) => {
                const isSelected =
                  selectedOption.filter((el) => {
                    return el._id === option._id;
                  }).length > 0;

                return (
                  <label
                    key={index}
                    className={`relative flex items-center justify-between rounded-md border px-4 py-3 cursor-pointer transition duration-150
          ${
            isSelected
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50"
          }
        `}
                  >
                    <input
                      type="checkbox"
                      name={`option-${subCategoryStyleDetails?.name}`}
                      value={option.title}
                      checked={isSelected}
                      onChange={() => handleOptionChange(option)}
                      className="sr-only"
                    />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {option.title}
                      </span>
                      <span className="text-sm text-gray-700 mt-0.5">
                        ₹{option.discountedPrice || option.price}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
                        ✓
                      </div>
                    )}
                  </label>
                );
              },
            )}
          </div>

          {selectedCustomizations.length > 0 && (
            <div className="border-t pt-2 relative">
              <div className="font-semibold mb-1 text-xs text-gray-500">
                Customizations
              </div>
              {selectedCustomizations.map((design) => (
                <div
                  className="flex justify-between text-xs mb-1 items-center"
                  key={design._id}
                >
                  <span className="text-gray-600">{design.title}</span>
                  <span className="flex items-center gap-1">
                    ₹
                    {design?.discountedPrice >= 0
                      ? design?.discountedPrice
                      : design?.price}
                    <button
                      className="ml-1 text-red-500 hover:text-red-700 p-1 rounded"
                      onClick={() => handleRemoveCustomization(design._id)}
                      aria-label="Remove customization"
                      tabIndex={0}
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                ₹
                {subCategoryStyleDetails?.discountedPrice +
                  totalCustomizationPrice}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-row mt-5 md:flex-col sm:gap-2 w-full md:mb-2">
          {/* <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-between px-4 bg-primary hover:bg-primary/90"
            onClick={() => {
              if(isPlacingOrder) return;
              if(!handleLoginForImageUploadAndScheduleCall()) return;
              setShowImagePicker(true);
            }}
            disabled={isPlacingOrder || NOT_LOGGED_IN_STEPS.includes(currentStepType)}
          >
            <div className="flex items-center gap-2 ">
              <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-xs font-normal text-white">Upload a Picture</span>
                <span className="text-[10px] text-gray-500 text-white">
                  Show us your desired look
                </span>
              </div>
            </div>
            {isPlacingOrder && orderType === "image_upload" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </Button> */}
          {user && user.role != UserRole.CUSTOMER && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-center text-white px-4 bg-primary hover:bg-primary/90 hover:text-white"
              onClick={() => {
                setIsMeasurementModalOpen(true);
              }}
            >
              Add To Cart
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-between px-4 bg-primary hover:bg-primary/90"
            onClick={handleScheduleCallClick}
            disabled={
              isPlacingOrder || NOT_LOGGED_IN_STEPS.includes(currentStepType)
            }
          >
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-xs font-normal text-white">
                  Schedule a call
                </span>
                <span className="text-[10px] text-gray-500 text-white">
                  Get assistance
                </span>
              </div>
            </div>
            {isPlacingOrder && orderType === "appointment" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <OrderSummaryContent />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Floating Cart Button */}
        <div className="fixed top-1 right-3 z-99">
          <Button
            onClick={() => setShowSidebar(true)}
            className="relative z-99 rounded-full bg-white shadow-lg  focus:bg-primary/10 transition-colors p-2 w-12 h-12 flex items-center justify-center"
            variant="ghost"
            aria-label="Open cart"
          >
            <ShoppingCart size={22} className="text-primary" />
            {selectedCustomizations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 border-2 border-white text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow">
                {selectedCustomizations.length}
              </span>
            )}
          </Button>
        </div>

        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="flex gap-2 w-full">
            {/* <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
              onClick={() => {
                if (isPlacingOrder) return;
                if (!handleLoginForImageUploadAndScheduleCall()) return;
                setShowImagePicker(true);
              }}
              disabled={
                isPlacingOrder || NOT_LOGGED_IN_STEPS.includes(currentStepType)
              }
            >
              <Camera className="w-4 h-4 text-white" />
              <span className="text-xs text-white">Upload Photo</span>
              {isPlacingOrder && orderType === "image_upload" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
              onClick={handleScheduleCallClick}
              disabled={
                isPlacingOrder || NOT_LOGGED_IN_STEPS.includes(currentStepType)
              }
            >
              <Phone className="w-4 h-4 text-white" />
              <span className="text-xs text-white">Schedule Call</span>
              {isPlacingOrder && orderType === "appointment" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </Button>
          </div>
        </div>

        {showSidebar && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => {
                if (isPlacingOrder) {
                  return;
                }
                setShowSidebar(false);
              }}
            />

            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(false)}
                    disabled={isPlacingOrder}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <OrderSummaryContent />
                </div>

                {user && user.role != UserRole.CUSTOMER && (
                  <Button
                    size="lg"
                    onClick={() => {
                      setIsMeasurementModalOpen(true);
                    }}
                    style={{
                      borderRadius: 0,
                    }}
                    className="flex justify-center items-center"
                  >
                    {isPlacingOrder && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Add To Cart
                  </Button>
                )}

                {user && user.role === UserRole.CUSTOMER && (
                  <Button
                    size="lg"
                    onClick={placeOrderWithCustomization}
                    style={{
                      borderRadius: 0,
                    }}
                    disabled={isPlacingOrder}
                    className="flex justify-center items-center"
                  >
                    {isPlacingOrder && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Confirm Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <MeasurementsModal
          isOpen={isMeasurementModalOpen}
          onOpenChange={setIsMeasurementModalOpen}
          onSubmit={(data) => {
            const details = {
              optionsData: {
                category: data.optionsData?.category,
                ...data.optionsData?.details,
              },
              bodyMeasurement: {
                category: data.bodyMeasurement?.category,
                ...data.bodyMeasurement?.details,
              },
            };

            handleAddToCart(details);
          }}
          isUpdaing={false}
          initialData={{}}
          key={""}
        />
      </div>
    </>
  );
};

export default OrderSummary;
