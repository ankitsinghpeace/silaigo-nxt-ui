"use client";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAllCategories,
  getCustomizationData,
  fetchSubCategoryData,
} from "@/services";
import { generateErrorMessage } from "@/lib/helpers";
import PlaceholderImage from "@/assets/custome-design-image-placeholder.svg";
import { Button } from "@/components/ui/button";
import {
  MeasurementsForm,
  MeasurementsModal,
} from "@/components/admin/modals/MeasurementsModal";
import {
  CartCheckout,
  CartCheckoutForm,
} from "@/components/admin/modals/CartCheckout";
import { downloadInvoicePDF } from "@/lib/downloadInvoicePdf";
import { InvoiceData } from "@/types/interface";
import { formatDate } from "@/components/customization/AppointmentScheduler";
import {
  cartCheckoutApi,
  getAndUpdateOrderId,
} from "@/services/modules/orders.api";
import { useToast } from "@/hooks/use-toast";
import MultiImageBookingModal from "@/components/MultiImageBookingModal";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTotalCustomizationPrice } from "@/components/OrderSummary";
import { useRouter } from "@/lib/next-router-compat";

/* ========================================================= */

const initialMeasurements = {
  optionsData: {
    category: null,
    details: {},
  },
  bodyMeasurements: {
    category: null,
    details: {},
  },
};
export default function CategoryPage() {
  /* ===================== STATES ===================== */
  const navigate = useRouter();
  const router = navigate;
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState<any[]>(
    [],
  );
  const [selectedSubCategoryStyleId, setSelectedSubCategoryStyleId] = useState<
    string | null
  >(null);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [isImageModalOpened, setIsImageModalOpened] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const imageType = useRef("");

  // measurements state
  // tab1 tailoring options
  const [selectedCategory1, setSelectedCategory1] = useState<string>("");
  const [formValues1, setFormValues1] = useState<
    Record<string, Record<string, string>>
  >({});
  // top level checkboxes
  const [visibleFields1, setVisibleFields1] = useState<Set<string>>(
    new Set(Object.keys({})),
  );
  // tab2 body measurements
  const [selectedCategory2, setSelectedCategory2] = useState<string>("");
  const [formValues2, setFormValues2] = useState<Record<string, string>>({});
  const measurementState = {
    state: {
      selectedCategory1,
      formValues1,
      visibleFields1,
      selectedCategory2,
      formValues2,
    },
    actions: {
      setSelectedCategory1,
      setFormValues1,
      setVisibleFields1,
      setSelectedCategory2,
      setFormValues2,
    },
  };

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const { toast } = useToast();

  /* ===================== QUERIES ===================== */

  const {
    data: categories,
    isPending: loadingCategories,
    error: categoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
  });

  const {
    data: customizations,
    isPending: loadingCustomizations,
    error: customizationError,
  } = useQuery({
    queryKey: ["customizations"],
    queryFn: getCustomizationData,
  });

  const { data: subCategories, isPending: loadingSubCategories } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: () => fetchSubCategoryData(selectedCategoryId),
    enabled: !!selectedCategoryId,
  });

  const selectedCategory = categories?.find(
    (c: any) => c.id === selectedCategoryId,
  );

  /* ===================== HANDLERS ===================== */

  const toggleOption = (option: any) => {
    setSelectedOptions((prev) =>
      prev.some((o) => o._id === option._id)
        ? prev.filter((o) => o._id !== option._id)
        : [...prev, option],
    );
  };

  const toggleCustomization = (item: any, type: string) => {
    setSelectedCustomizations((prev) =>
      prev.some((c) => c._id === item._id)
        ? prev.filter((c) => c._id !== item._id)
        : [...prev, { ...item, type }],
    );
  };

  const resetCurrentSelection = () => {
    setSelectedCategoryId(null);
    setSelectedOptions([]);
    setSelectedCustomizations([]);
    setSelectedSubCategoryStyleId(null);
    setCustomPrice(null);
    setEditIndex(null);
    setSelectedImages([]);
    imageType.current = "";
  };

  const buildItemObject = async () => {
    localStorage.setItem(
      "session_body_measurements",
      JSON.stringify(formValues2),
    );
    const selectedStyle = subCategories?.styles?.find(
      (s: any) => s._id === selectedSubCategoryStyleId,
    );
    let price = null;

    if (customPrice > 0) {
      price = customPrice;
    } else {
      const customizationPrice = getTotalCustomizationPrice(
        selectedCustomizations,
        selectedOptions,
      );
      const stylePrice =
        selectedStyle.discountedPrice > 0
          ? selectedStyle.discountedPrice
          : selectedStyle.price;
      price = customizationPrice + stylePrice;
    }

    const orderId = await getAndUpdateOrderId(
      subCategories?.subCategoryId,
      selectedStyle.name,
    );

    return {
      customizations: selectedCustomizations.map((item) => ({
        optionId: item._id,
        type: item.type,
      })),
      subCategory: subCategories?.subCategoryId,
      subCategoryStyleId: selectedSubCategoryStyleId,
      options: selectedOptions.map((el) => ({
        categoryId: selectedCategory._id,
        optionId: el._id,
      })),
      imageUrls: selectedImages,
      customPrice: price,
      isCustomPriceManuallySet: customPrice > 0,
      measurements: {
        optionsData: {
          category: selectedCategory1,
          ...formValues1,
        },
        bodyMeasurement: {
          category: selectedCategory2,
          ...formValues2,
        },
      },
      orderId,
      /* ===== UI METADATA ===== */
      meta: {
        category: selectedCategory
          ? {
            id: selectedCategory._id,
            name: selectedCategory.name,
          }
          : null,
        style: selectedStyle
          ? {
            id: selectedStyle._id,
            name: selectedStyle.name,
            image: selectedStyle.image || PlaceholderImage,
          }
          : null,
        selectedCategoryId,
      },
    };
  };

  const handleAddToCart = async () => {
    const isFabricSelected = selectedImages.filter((el) => {
      return el.toLowerCase().includes("fabric");
    });

    if (isFabricSelected.length === 0) {
      toast({
        description: "please! select a fabric image",
        variant: "destructive",
      });
      return;
    }

    if (!customPrice) {
      toast({
        description: "Please add a custom price",
        variant: "destructive",
      });
      return;
    }
    const item = await buildItemObject();

    if (editIndex !== null) {
      const copy = [...selectedItems];
      copy[editIndex] = item;
      setSelectedItems(copy);
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
    resetCurrentSelection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditItem = (index: number) => {
    const item = selectedItems[index];
    setEditIndex(index);
    setCustomPrice(item.customPrice ?? null);
    setSelectedSubCategoryStyleId(item.subCategoryStyleId ?? null);
    setSelectedOptions(item.options.map((o: any) => ({ _id: o.optionId })));
    setSelectedCustomizations(
      item?.customizations.map((c: any) => ({ _id: c.optionId, type: c.type })),
    );
    setSelectedCategoryId(item.meta.selectedCategoryId);
    const { optionsData, bodyMeasurement } = item.measurements;
    setSelectedCategory1(optionsData.category);
    setFormValues1(optionsData);

    setSelectedCategory2(bodyMeasurement.category);
    setFormValues2(bodyMeasurement);
    setSelectedImages(item.imageUrls);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));

    if (editIndex === index) {
      resetCurrentSelection();
    }
  };

  /// place order
  const {
    mutateAsync: checkoutCart,
    isPending: isPlacingOrder,
    error: placingOrderError,
  } = useMutation({
    mutationFn: (payload: any) => {
      return cartCheckoutApi(payload);
    },
    onSuccess: () => {
      toast({
        title: "Order placed",
        description: "The order has been successfully placed",
      });
      resetCurrentSelection();
    },
    onError: (error) => {
      toast({
        title: "Error placing order",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const checkout = async (data: any) => {
    try {
      setIsGeneratingInvoice(true);
      localStorage.clear();
      const {
        advance_collected = 0,
        extra_items = [],
        notes,
        ...customerData
      } = data;

      const payload = {
        orderItems: selectedItems.map((item) => {
          const {
            meta,
            customPrice,
            measurements,
            isCustomPriceManuallySet,
            imageUrls,
            ...remaining
          } = item;
          return {
            customPrice: isCustomPriceManuallySet ? customPrice : null,
            measurements,
            imageUrls,
            items: remaining,
            notes,
          };
        }),
        customerData: {
          ...customerData,
          date: formatDate(new Date(customerData.date)),
        },
      };

      await checkoutCart(payload);

      const invoiceCustomer = {
        name: customerData.name ?? "",
        addressLine1: customerData.addressLine1,
        addressLine2: customerData.addressLine2 ?? "",
        addressLine3: `${customerData.city} ${customerData.pincode}, ${customerData.state}`,
        phone: customerData.phone,
      };

      const cartTotal = selectedItems.reduce((sum, item) => {
        const price = Number(item.customPrice);
        sum += Number(price);
        return sum;
      }, 0);

      const extraItemsTotal = extra_items.reduce(
        (sum, item) => sum + item.unitCost * item.qty,
        0,
      );
      const subTotal = cartTotal + extraItemsTotal;

      const invoiceItems = [
        ...extra_items,
        ...selectedItems.map((item) => ({
          name: item.meta.style.name,
          unitCost: Number(item.customPrice),
          qty: 1,
        })),
      ];

      const rawInvoiceNo = selectedItems.map((item) => item.orderId).join("_");

      const invoiceNo =
        rawInvoiceNo.length > 30
          ? rawInvoiceNo.slice(0, 30) + "..."
          : rawInvoiceNo;
      const tax = subTotal * 0.05;

      const invoice: InvoiceData = {
        customer: invoiceCustomer,
        items: invoiceItems,
        invoiceNo,
        totals: {
          subtotal: subTotal - tax,
          tax: tax,
          advance: advance_collected,
          total: subTotal,
        },
        date: new Date().toLocaleDateString(),
      };

      await downloadInvoicePDF(invoice);
      setIsGeneratingInvoice(false);
      router.push("/admin/dashboard");
    } catch (error) {
      console.log(error);
      toast({
        description: generateErrorMessage(error) || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  /* ===================== LOADING / ERROR ===================== */

  if (loadingCategories || loadingCustomizations) {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (categoryError || customizationError) {
    return (
      <p className="text-center text-red-500 py-10">
        {generateErrorMessage(categoryError || customizationError)}
      </p>
    );
  }

  /* ===================== UI ===================== */

  return (
    <div className="mx-auto w-full px-2 py-8 flex flex-col md:flex-row gap-8">
      <section className="w-full md:w-[65%] flex flex-col gap-4">
        <div className="bg-white border-b">
          <div className="mx-auto px-4 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 w-fit"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Create New Order
            </h1>
          </div>
        </div>

        {/* ===================== CATEGORY ===================== */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Select Category</h2>

          <select
            value={selectedCategoryId ?? ""}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            className="border p-2 rounded w-80"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {selectedCategory && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedCategory.options.map((opt: any) => {
                const isSelected = selectedOptions.some(
                  (o) => o._id === opt._id,
                );

                return (
                  <div
                    key={opt._id}
                    onClick={() => toggleOption(opt)}
                    className={`border p-3 rounded cursor-pointer text-center
                    ${isSelected ? "ring-2 ring-primary bg-primary/10" : "bg-muted"}
                  `}
                  >
                    <p className="font-medium">{opt.title}</p>

                    {opt.discountedPrice && (
                      <p className="text-xs line-through text-muted-foreground">
                        ₹{opt.price}
                      </p>
                    )}

                    <p className="text-sm text-primary font-semibold">
                      ₹{opt.discountedPrice ?? opt.price}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================== SUBCATEGORY STYLES ===================== */}
        {selectedCategoryId && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Subcategory Styles</h2>

            {loadingSubCategories ? (
              <p>Loading styles...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subCategories?.styles.map((style: any) => {
                  const isSelected = selectedSubCategoryStyleId === style._id;

                  return (
                    <div
                      key={style._id}
                      onClick={() => setSelectedSubCategoryStyleId(style._id)}
                      className={`border rounded overflow-hidden cursor-pointer
                      ${isSelected ? "ring-2 ring-primary" : ""}
                    `}
                    >
                      <img
                        src={style.image || PlaceholderImage}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-2 text-center">
                        <p className="font-medium">{style.name}</p>

                        {style.discountedPrice && (
                          <p className="text-xs line-through text-muted-foreground">
                            ₹{style.price}
                          </p>
                        )}

                        <p className="text-sm text-primary font-semibold">
                          ₹{style.discountedPrice ?? style.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ===================== CUSTOMIZATIONS ===================== */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">Customizations</h2>

          <h3 className="font-medium">Fabric</h3>
          <div
            onClick={() => {
              imageType.current = "Fabric";
              setIsImageModalOpened(true);
            }}
            className={`border w-[50%] md:w-[20%] rounded overflow-hidden cursor-pointer
                    `}
          >
            <img
              src={PlaceholderImage}
              className="w-full aspect-square object-cover"
            />
            <div className="p-2 text-center">
              <p className="font-medium">Fabric</p>
            </div>
          </div>

          {customizations
            ?.sort((a, b) => a.rank - b.rank)
            .map((cat: any) => (
              <div key={cat._id} className="space-y-3">
                <h3 className="font-medium">{cat.type}</h3>
                <Button
                  onClick={() => {
                    imageType.current = cat.type.replaceAll(" ", "-");
                    setIsImageModalOpened(true);
                  }}
                >
                  Add images
                </Button>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cat.options.map((design: any) => {
                    const isSelected = selectedCustomizations.some(
                      (c) => c._id === design._id,
                    );

                    return (
                      <div
                        key={design._id}
                        onClick={() => toggleCustomization(design, cat.type)}
                        className={`border rounded overflow-hidden cursor-pointer
                      ${isSelected ? "ring-2 ring-primary" : ""}
                    `}
                      >
                        <img
                          src={design.imageUrl || PlaceholderImage}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-2 text-center">
                          <p className="font-medium">{design.title}</p>

                          {design.discountedPrice && (
                            <p className="text-xs line-through text-muted-foreground">
                              ₹{design.price}
                            </p>
                          )}

                          <p className="text-sm text-primary font-semibold">
                            ₹{design.discountedPrice ?? design.price}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </section>

        <div className="p-6 border-2 border-gray-400 rounded-lg mt-5">
          <MeasurementsForm measurementState={measurementState} />
        </div>

        {/* ===================== PRICE + ADD ===================== */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              placeholder="Custom price"
              value={customPrice ?? ""}
              onChange={(e) =>
                setCustomPrice(e.target.value ? Number(e.target.value) : null)
              }
              className="border p-2 rounded w-60"
            />
          </div>

          <Button
            onClick={async () => {
              await handleAddToCart();
            }}
          >
            {editIndex !== null ? "Update Item" : "Add to Cart"}
          </Button>
        </section>
      </section>
      {/* ===================== SELECTED ITEMS ===================== */}
      <section className="w-full md:w-[35%] flex flex-col gap-2 border-l-0 md:border-l-2 px-4">
        <h2 className="text-lg font-semibold">Selected Items</h2>

        {selectedItems.length === 0 && (
          <p className="text-sm text-muted-foreground">No items added yet</p>
        )}

        {selectedItems.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 flex gap-4 items-start bg-white"
          >
            {/* IMAGE */}
            <div className="w-24 h-24 rounded overflow-hidden bg-muted flex-shrink-0">
              <img
                src={item.meta?.style?.image || PlaceholderImage}
                alt={item.meta?.style?.name || "Style"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* DETAILS */}
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-sm">
                {item.meta?.category?.name}
              </p>

              <p className="text-sm text-muted-foreground">
                {item.meta?.style?.name}
              </p>

              <p className="text-sm">
                Customizations:{" "}
                <span className="text-muted-foreground">
                  {item.customizations.length}
                </span>
              </p>

              <p className="text-sm">
                Options:{" "}
                <span className="text-muted-foreground">
                  {item.options.length}
                </span>
              </p>

              <p className="text-sm font-semibold text-primary">
                Custom Price: {item.customPrice ? `₹${item.customPrice}` : "—"}
              </p>
            </div>

            {/* ACTION */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditItem(index)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRemoveItem(index)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        <div className="mt-5">
          <CartCheckoutForm
            onSubmit={async (data) => {
              await checkout(data);
            }}
            isSubmitting={isGeneratingInvoice}
          />
        </div>
      </section>
      <MultiImageBookingModal
        open={isImageModalOpened}
        onOpenChange={setIsImageModalOpened}
        onClose={() => {
          setIsImageModalOpened(false);
        }}
        onImageSelect={function (urls: string[]): void {
          setSelectedImages((prev) => {
            return [...new Set([...prev, ...urls])];
          });
        }}
        alreadySelectedImages={selectedImages}
        isPreviewMode={false}
        type={imageType.current}
      />
    </div>
  );
}
