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
import { MeasurementsForm } from "@/components/admin/modals/MeasurementsModal";
import { CartCheckoutForm } from "@/components/admin/modals/CartCheckout";
import { downloadInvoicePDF } from "@/lib/downloadInvoicePdf";
import { InvoiceData } from "@/types/interface";
import { formatDate } from "@/components/customization/AppointmentScheduler";
import {
  cartCheckoutApi,
  getAndUpdateOrderId,
  updateOrdersProcessingState,
  getAllOrders,
} from "@/services/modules/orders.api";
import { useToast } from "@/hooks/use-toast";
import MultiImageBookingModal from "@/components/MultiImageBookingModal";
import Link from "next/link";
import { ChevronLeft, Check, ChevronRight } from "lucide-react";
import { getTotalCustomizationPrice } from "@/components/OrderSummary";
import { useRouter } from "@/lib/next-router-compat";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";

/* ========================================================= */

const getImgSrc = (src?: any) => {
  if (!src) {
    return typeof PlaceholderImage === "string"
      ? PlaceholderImage
      : (PlaceholderImage as any)?.src || "";
  }
  if (typeof src === "string") return src;
  return src?.src || src;
};

const extractMongoIds = (obj: any): string[] => {
  const ids: Set<string> = new Set();
  const traverse = (val: any) => {
    if (!val) return;
    if (typeof val === "string") {
      if (/^[0-9a-fA-F]{24}$/.test(val)) {
        ids.add(val);
      }
      return;
    }
    if (typeof val === "object") {
      if (
        val.id &&
        typeof val.id === "string" &&
        /^[0-9a-fA-F]{24}$/.test(val.id)
      ) {
        ids.add(val.id);
      }
      if (
        val._id &&
        typeof val._id === "string" &&
        /^[0-9a-fA-F]{24}$/.test(val._id)
      ) {
        ids.add(val._id);
      }
      for (const k of Object.keys(val)) {
        traverse(val[k]);
      }
    }
  };
  traverse(obj);
  return Array.from(ids);
};

export default function CategoryPage() {
  /* ===================== STATES ===================== */
  const navigate = useRouter();
  const router = navigate;
  
  // Wizard Step State ("category" | "customization" | "measurements" | "pricing")
  const [activeTab, setActiveTab] = useState<string>("category");

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

  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(
    {},
  );
  const imageType = useRef("");

  const selectedImages = Object.values(categoryImages).filter(Boolean);

  const [selectedCategory1, setSelectedCategory1] = useState<string>("");
  const [formValues1, setFormValues1] = useState<
    Record<string, Record<string, string>>
  >({});
  const [visibleFields1, setVisibleFields1] = useState<Set<string>>(
    new Set(Object.keys({})),
  );

  const [selectedCategory2, setSelectedCategory2] = useState<string>("");
  const [formValues2, setFormValues2] = useState<Record<string, string>>({});
  const [itemNotes, setItemNotes] = useState<string>("");

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
    setItemNotes("");
    setEditIndex(null);
    setCategoryImages({});
    imageType.current = "";

    setSelectedCategory1("");
    setFormValues1({});
    setVisibleFields1(new Set());
    setSelectedCategory2("");
    setFormValues2({});
    setActiveTab("category");
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

    if (customPrice && customPrice > 0) {
      price = customPrice;
    } else {
      const customizationPrice = getTotalCustomizationPrice(
        selectedCustomizations,
        selectedOptions,
      );
      const stylePrice =
        selectedStyle?.discountedPrice > 0
          ? selectedStyle.discountedPrice
          : selectedStyle?.price || 0;
      price = customizationPrice + stylePrice;
    }

    const orderId = await getAndUpdateOrderId(
      subCategories?.subCategoryId,
      selectedStyle?.name || "",
    );

    return {
      customizations: selectedCustomizations.map((item) => ({
        optionId: item._id,
        type: item.type,
      })),
      subCategory: subCategories?.subCategoryId,
      subCategoryStyleId: selectedSubCategoryStyleId,
      options: selectedOptions.map((el) => ({
        categoryId: selectedCategory?._id,
        optionId: el._id,
      })),
      imageUrls: selectedImages,
      categoryImages,
      customPrice: price,
      isCustomPriceManuallySet: customPrice !== null && customPrice > 0,
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
      notes: itemNotes.trim(),
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
    if (!categoryImages["Fabric"]) {
      toast({
        description: "Please select a fabric image",
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
      setSelectedItems((prev) =>
        prev.map((existingItem, index) =>
          index === editIndex ? item : existingItem,
        ),
      );
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }

    resetCurrentSelection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditItem = (index: number) => {
    const item = selectedItems[index];
    if (!item) return;

    setEditIndex(index);
    setCustomPrice(item.customPrice ?? null);
    setItemNotes(item.notes ?? "");
    setSelectedSubCategoryStyleId(item.subCategoryStyleId ?? null);

    setSelectedOptions(
      (item.options ?? []).map((o: any) => ({
        _id: o.optionId,
      })),
    );

    setSelectedCustomizations(
      (item.customizations ?? []).map((c: any) => ({
        _id: c.optionId,
        type: c.type,
      })),
    );

    setSelectedCategoryId(item.meta?.selectedCategoryId ?? null);

    const {
      optionsData = {},
      bodyMeasurement = {},
    } = item.measurements ?? {};

    setSelectedCategory1(optionsData.category ?? "");
    setFormValues1(
      Object.fromEntries(
        Object.entries(optionsData).filter(([key]) => key !== "category"),
      ) as Record<string, Record<string, string>>,
    );

    setSelectedCategory2(bodyMeasurement.category ?? "");
    setFormValues2(
      Object.fromEntries(
        Object.entries(bodyMeasurement).filter(([key]) => key !== "category"),
      ) as Record<string, string>,
    );

    setCategoryImages(item.categoryImages ?? {});
    setActiveTab("category");
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) {
      resetCurrentSelection();
    }
  };

  /* ===================== CHECKOUT ===================== */
  const { mutateAsync: checkoutCart } = useMutation({
    mutationFn: (payload: any) => {
      return cartCheckoutApi(payload);
    },
    onSuccess: async (res: any) => {
      try {
        const orderList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.orders)
              ? res.orders
              : res
                ? [res]
                : [];

        for (const item of orderList) {
          const targetId = item?.id || item?._id || item?.orderId;
          if (targetId) {
            await updateOrdersProcessingState(targetId, {
              nextState: "ORDER_PLACED",
            }).catch(() => {});
          }
        }
      } catch (e) {}

      if (typeof window !== "undefined") {
        const pId = localStorage.getItem("pickupId");
        if (pId) {
          try {
            const createdPickups = JSON.parse(
              localStorage.getItem("createdOrderPickupIds") || "[]",
            );
            if (!createdPickups.includes(pId)) {
              createdPickups.push(pId);
              localStorage.setItem(
                "createdOrderPickupIds",
                JSON.stringify(createdPickups),
              );
            }
          } catch (e) {}
          localStorage.removeItem("pickupId");
        }
      }
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
      const rawPickupId =
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("pickupId") ||
            localStorage.getItem("pickupId")
          : null) ||
        (router.query?.pickupId as string) ||
        undefined;
      const pickupId = rawPickupId || undefined;

      const { advance_collected = 0, extra_items = [], ...customerData } = data;

      const payload = {
        pickupId,
        orderProcessingState: "ORDER_PLACED",
        orderItems: selectedItems.map((item) => {
          const {
            meta,
            customPrice,
            measurements,
            isCustomPriceManuallySet,
            imageUrls,
            categoryImages: _,
            notes,
            ...remaining
          } = item;
          return {
            customPrice: isCustomPriceManuallySet ? customPrice : null,
            measurements,
            imageUrls,
            items: remaining,
            notes: notes || "",
            pickupId,
            orderProcessingState: "ORDER_PLACED",
          };
        }),
        customerData: {
          ...customerData,
          pickupId,
          date: formatDate(new Date(customerData.date)),
        },
      };

      const checkoutResult = await checkoutCart(payload);
      try {
        let targetIds = extractMongoIds(checkoutResult);

        if (targetIds.length === 0) {
          const latest = await getAllOrders(
            new URLSearchParams({
              page: "1",
              limit: "10",
              sortBy: "newest",
            }).toString(),
          );
          const matched = (latest?.orders || []).filter(
            (o: any) =>
              selectedItems.some(
                (item) => item.orderId && o.orderId === item.orderId,
              ) ||
              (customerData.phone && o.customerPhone === customerData.phone),
          );
          matched.forEach((m: any) => {
            const hex = m.id || m._id;
            if (hex && /^[0-9a-fA-F]{24}$/.test(hex)) targetIds.push(hex);
          });
        }

        for (const hexId of targetIds) {
          await updateOrdersProcessingState(hexId, {
            nextState: "ORDER_PLACED",
          }).catch((err) => {
            console.error("Error setting ORDER_PLACED for order:", hexId, err);
          });
        }
      } catch (e) {
        console.error("Error overriding order processing state:", e);
      }

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
        (sum: number, item: any) => sum + item.unitCost * item.qty,
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
    <div className="mx-auto w-full px-4 py-6 flex flex-col xl:flex-row gap-8 max-w-7xl">
      {/* LEFT SECTION - BUILDER */}
      <section className="w-full xl:w-[65%] flex flex-col gap-6">
        <div className="flex flex-col gap-2 border-b pb-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 w-fit"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        </div>

        {/* STEPPER / TABS HEADER */}
        <div className="flex border rounded-lg overflow-hidden bg-gray-50 p-1">
          {[
            { id: "category", label: "1. Category & Style" },
            { id: "customization", label: "2. Fabrics & Add-ons" },
            { id: "measurements", label: "3. Measurements" },
            { id: "pricing", label: "4. Review & Price" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium transition-all rounded-md ${
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          {/* TAB 1: CATEGORY & STYLES */}
          {activeTab === "category" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-3">Select Category</h2>
                <select
                  value={selectedCategoryId ?? ""}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  className="border p-2.5 rounded-md w-full sm:w-80 bg-white"
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
              </div>

              {selectedCategory && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Category Options</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedCategory.options.map((opt: any) => {
                      const isSelected = selectedOptions.some(
                        (o) => o._id === opt._id,
                      );
                      return (
                        <div
                          key={opt._id}
                          onClick={() => toggleOption(opt)}
                          className={`border p-3 rounded-lg cursor-pointer text-center transition-all ${
                            isSelected
                              ? "ring-2 ring-primary bg-primary/5 border-primary"
                              : "hover:border-gray-400"
                          }`}
                        >
                          <p className="font-medium text-sm">{opt.title}</p>
                          {opt.discountedPrice && (
                            <p className="text-xs line-through text-muted-foreground">
                              ₹{opt.price}
                            </p>
                          )}
                          <p className="text-xs text-primary font-semibold mt-1">
                            ₹{opt.discountedPrice ?? opt.price}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedCategoryId && (
                <div className="pt-4 border-t">
                  <h3 className="text-base font-semibold mb-3">Subcategory Styles</h3>
                  {loadingSubCategories ? (
                    <p className="text-sm text-muted-foreground">Loading styles...</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {subCategories?.styles.map((style: any) => {
                        const isSelected = selectedSubCategoryStyleId === style._id;
                        return (
                          <div
                            key={style._id}
                            onClick={() => setSelectedSubCategoryStyleId(style._id)}
                            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                              isSelected
                                ? "ring-2 ring-primary border-primary"
                                : "hover:border-gray-400"
                            }`}
                          >
                            <img
                              src={getImgSrc(style.image)}
                              className="w-full aspect-square object-cover"
                              alt={style.name}
                            />
                            <div className="p-2 text-center bg-gray-50">
                              <p className="font-medium text-xs">{style.name}</p>
                              <p className="text-xs text-primary font-semibold mt-0.5">
                                ₹{style.discountedPrice ?? style.price}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setActiveTab("customization")}>
                  Next: Customizations <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: FABRICS & CUSTOMIZATIONS */}
          {activeTab === "customization" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Fabric Selection *</h3>
                <div
                  onClick={() => {
                    imageType.current = "Fabric";
                    setIsImageModalOpened(true);
                  }}
                  className={`border w-32 rounded-lg overflow-hidden cursor-pointer text-center p-2 ${
                    categoryImages["Fabric"] ? "ring-2 ring-primary border-primary" : ""
                  }`}
                >
                  <img
                    src={getImgSrc(categoryImages["Fabric"])}
                    className="w-full aspect-square object-cover rounded"
                    alt="Fabric"
                  />
                  <p className="text-xs font-medium mt-1">
                    {categoryImages["Fabric"] ? "Change Fabric" : "Select Fabric"}
                  </p>
                </div>
              </div>

              {customizations
                ?.sort((a: any, b: any) => a.rank - b.rank)
                .map((cat: any) => {
                  const currentCatImage = categoryImages[cat.type];
                  return (
                    <div key={cat._id} className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{cat.type}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            imageType.current = cat.type;
                            setIsImageModalOpened(true);
                          }}
                        >
                          {currentCatImage ? "Change Ref Image" : "Upload Ref Image"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {cat.options.map((design: any) => {
                          const isSelected = selectedCustomizations.some(
                            (c) => c._id === design._id,
                          );
                          return (
                            <div
                              key={design._id}
                              onClick={() => toggleCustomization(design, cat.type)}
                              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                isSelected
                                  ? "ring-2 ring-primary border-primary bg-primary/5"
                                  : "hover:border-gray-400"
                              }`}
                            >
                              <img
                                src={getImgSrc(design.imageUrl)}
                                className="w-full aspect-square object-cover"
                                alt={design.title}
                              />
                              <div className="p-2 text-center bg-gray-50">
                                <p className="font-medium text-xs">{design.title}</p>
                                <p className="text-xs text-primary font-semibold mt-0.5">
                                  ₹{design.discountedPrice ?? design.price}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setActiveTab("category")}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab("measurements")}>
                  Next: Measurements <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: MEASUREMENTS */}
          {activeTab === "measurements" && (
            <div className="space-y-6">
              <MeasurementsForm measurementState={measurementState} />

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setActiveTab("customization")}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab("pricing")}>
                  Next: Pricing & Notes <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEW & PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="custom-price" className="text-sm font-semibold">
                  Custom Price (₹) *
                </Label>
                <input
                  id="custom-price"
                  type="number"
                  placeholder="Enter total price"
                  value={customPrice ?? ""}
                  onChange={(e) =>
                    setCustomPrice(e.target.value ? Number(e.target.value) : null)
                  }
                  className="border p-2.5 rounded-md w-full sm:w-80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-notes" className="text-sm font-semibold">
                  Item Notes
                </Label>
                <Textarea
                  id="item-notes"
                  placeholder="Add custom notes or instructions for this item..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setActiveTab("measurements")}>
                  Back
                </Button>
                <Button
                  onClick={async () => {
                    await handleAddToCart();
                  }}
                >
                  {editIndex !== null ? "Update Item in Cart" : "Add Item to Cart"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RIGHT SECTION - CART & CHECKOUT */}
      <section className="w-full xl:w-[35%] flex flex-col gap-4 border-t xl:border-t-0 xl:border-l pl-0 xl:pl-6 pt-6 xl:pt-0">
        <h2 className="text-lg font-semibold">Order Cart Summary</h2>

        {selectedItems.length === 0 && (
          <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground bg-gray-50">
            <p className="text-sm">No items added to the order yet.</p>
            <p className="text-xs mt-1">Complete the steps on the left and click "Add Item to Cart".</p>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 flex gap-3 items-start bg-white shadow-xs"
            >
              <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={getImgSrc(item.meta?.style?.image || item.imageUrls?.[0])}
                  alt={item.meta?.style?.name || "Style"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-0.5 text-xs">
                <p className="font-semibold text-gray-900">
                  {item.meta?.category?.name}
                </p>
                <p className="text-muted-foreground">
                  {item.meta?.style?.name}
                </p>
                <p className="font-medium text-primary pt-1">
                  Price: {item.customPrice ? `₹${item.customPrice}` : "—"}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleEditItem(index)}
                  className="h-7 text-xs"
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => handleRemoveItem(index)}
                  className="h-7 text-xs"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-2 pt-4 border-t">
            <CartCheckoutForm
              onSubmit={async (data) => {
                await checkout(data);
              }}
              isSubmitting={isGeneratingInvoice}
            />
          </div>
        )}
      </section>

      {/* MULTI IMAGE MODAL */}
      <MultiImageBookingModal
        open={isImageModalOpened}
        onOpenChange={setIsImageModalOpened}
        onClose={() => {
          setIsImageModalOpened(false);
        }}
        onImageSelect={function (urls: string[]): void {
          if (urls.length > 0 && imageType.current) {
            setCategoryImages((prev) => ({
              ...prev,
              [imageType.current]: urls[urls.length - 1],
            }));
          }
        }}
        alreadySelectedImages={
          categoryImages[imageType.current]
            ? [categoryImages[imageType.current]]
            : []
        }
        isPreviewMode={false}
        type={imageType.current}
      />
    </div>
  );
}