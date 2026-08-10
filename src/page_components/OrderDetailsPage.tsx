/* eslint-disable react-refresh/only-export-components */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  Loader2,
  CalendarX,
  Tag,
  X,
  Info,
  Printer,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  getOrderByIdApi,
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
  validateCouponApi,
  cancelOrderApi,
  removeCustomizationsOrOptionsApi,
  updateOrdersImagesApi,
} from "@/services/modules/orders.api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ImagePreview from "@/components/admin/ImagePreview";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { useAuth } from "@/contexts/AuthContext";
import AppointmentScheduler from "@/components/customization/AppointmentScheduler";
import { OrderDetailsProps } from "@/types/interface";
import { OrderStatus } from "@/types/enums";
import { generateErrorMessage } from "@/lib/helpers";
import EligibleCoupons from "@/components/EligibleCoupons";
import MeasurementsTable from "@/components/MeasurementsTable";
import { useReactToPrint } from "react-to-print";
import EventsOptions from "@/components/admin/EventsOptions";
import UpdateOrderCustomizations from "./admin/UpdateOrderCustomizations";
import UpdateOrderOptions from "./admin/UpdateOrderOptions";
import { UserRole } from "@/services";
import MultiImageBookingModal from "@/components/MultiImageBookingModal";
import { cn } from "@/lib/utils";
import { useRouter } from "@/lib/next-router-compat";

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return "bg-green-100 text-green-800";
    case OrderStatus.PAYMENT_DONE:
      return "bg-green-100 text-green-800";
    case OrderStatus.PLACED:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.PAYMENT_PENDING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case OrderStatus.PENDING:
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusDescription = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return "Your order has been completed";
    case OrderStatus.PLACED:
      return "Your order has been placed and is being processed";
    case OrderStatus.PAYMENT_PENDING:
      return "Payment is pending for your order";
    case OrderStatus.CANCELLED:
      return "This order has been cancelled";
    case OrderStatus.PENDING:
    default:
      return "Your order is pending";
  }
};

const formatTimeTo12Hour = (time: string) => {
  try {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "h:mm a");
  } catch (error) {
    return time;
  }
};

const PriceBreakdownPopup = ({
  showPopup,
  onClose,
  priceBreakup,
  couponCode = null,
  couponValue = 0,
}) => {
  if (!showPopup) return null;

  const subtotal =
    priceBreakup.basePrice +
    priceBreakup.customizations.reduce((sum, item) => sum + item.price, 0);
  const finalTotal = subtotal - couponValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs sm:max-w-md relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">
          Price Breakdown
        </h3>

        <div className="divide-y max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center py-2 text-xs sm:text-sm">
            <span className="text-gray-700">Base Price</span>
            <span className="font-medium">
              ₹{priceBreakup.basePrice.toLocaleString()}
            </span>
          </div>

          {priceBreakup.customizations.map((customization, index) => (
            <div
              className="flex justify-between items-center py-2 text-xs sm:text-sm"
              key={`${customization.title}-${index}`}
            >
              <span className="text-gray-700 max-w-[60%] truncate">
                {customization.title}
              </span>
              <span className="font-medium">
                ₹{customization.price.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="flex justify-between items-center py-2 text-xs sm:text-sm font-medium">
            <span className="text-gray-800">Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          {couponCode && couponValue > 0 && (
            <div className="flex justify-between items-center py-2 text-xs sm:text-sm text-green-600">
              <span>Coupon ({couponCode})</span>
              <span>-₹{couponValue.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center text-sm sm:text-base font-bold">
            <span>Total</span>
            <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
          </div>
        </div>

        <button
          className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface OrderDetailsPageProps {
  /** When provided the component renders this order instead of reading it from the route. */
  orderId?: string;
  /** Renders without page chrome (used inside admin modals). */
  embedded?: boolean;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  orderId,
  embedded = false,
}) => {
  const { id: routeId } = useRouter().query;
  const id = orderId ?? routeId;
  const navigate = useRouter();
  const router = navigate;
  const { toast } = useToast();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showAppointmentScheduler, setShowAppointmentScheduler] =
    useState(false);
  const [showEligibleCoupons, setShowEligibleCoupons] = useState(false);
  const paymentCardRef = useRef<HTMLDivElement | null>(null);
  const [isUpdateCusomizationsModalOpen, setIsCusomizationsUpdateModalOpen] =
    useState(false);
  const [isUpdateOptionsModalOpen, setIsOptionsUpdateModalOpen] =
    useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploadedImages, setUploadedImageUrls] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const imageType = useRef("");

  const {
    data: orderData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      try {
        const response: OrderDetailsProps = await getOrderByIdApi(id);
        if (response.payment._id) {
          setAppliedCoupon({
            code: response.payment.coupon,
            discount:
              Number(response.payment.amount) -
              Number(response.payment.discountedAmount),
          });
        }
        return response as OrderDetailsProps;
      } catch (error) {
        toast({
          title: "Error",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: false,
  });

  const { mutate: validateCouponMutation, isPending: isValidatingCoupon } =
    useMutation({
      mutationFn: (couponCode: string) =>
        validateCouponApi({
          couponCode,
          orderAmount: orderData.priceBreakup.total,
        }),
      onSuccess: (data) => {
        setAppliedCoupon(data);
        toast({
          title: "Success",
          description: "Coupon applied successfully!",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    });

  const { mutate: cancelOrderMutation, isPending: isCancellingOrder } =
    useMutation({
      mutationFn: () => cancelOrderApi(orderData.order._id),
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: "Order cancl success",
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    });

  const {
    mutate: removeCustomizationsAndOptions,
    isPending: isRemovingOrderOptions,
  } = useMutation({
    mutationFn: async (body: any) => {
      const data = await removeCustomizationsOrOptionsApi(body);
      return data;
    },
    onSuccess: (data) => {
      refetch();
      toast({
        title: "Success",
        description: "Order updated success",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const orderImagesUpdatemutation = useMutation({
    mutationFn: updateOrdersImagesApi,
    onSuccess: () => {
      refetch();
      setUploadedImageUrls([]);
      setRemovedImages([]);
      toast({ title: "Images updated" });
    },
    onError: () => {
      toast({ title: "Failed to update images", variant: "destructive" });
    },
  });

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleScheduleAppointment = (date: Date, timeSlot: string) => {
    setShowAppointmentScheduler(false);
    refetch();
  };

  const { error, isLoading: loadingRazorpay, Razorpay } = useRazorpay();

  const handlePayment = async () => {
    try {
      // Calculate the 20% advance amount after coupon discount
      const payableAmount = Math.round(
        (orderData.priceBreakup.total - (appliedCoupon?.discount || 0)) * 0.2,
      );

      // Create Razorpay order with the payable amount
      // Assuming your API supports passing amount now, else you may need to adjust server side
      const order: any = await createRazorpayOrderApi(id, appliedCoupon?.code);

      const options: RazorpayOrderOptions = {
        key: "rzp_live_VzQVC67uCX5t1w",
        amount: payableAmount * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "Silaigo",
        description: "Test Transaction",
        order_id: order.id,
        handler: async (response) => {
          try {
            const res = await verifyRazorpayPaymentApi({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            refetch();
          } catch (error) {
            toast({
              title: "Something went wrong",
              description: generateErrorMessage(error),
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user?.firstName + " " + user?.lastName,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: "#5095a3",
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.log(error);
      const err = JSON.parse(error.message);
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Order Details",
    pageStyle: `
      @page { margin: 20mm; }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    `,
    contentRef: printRef,
  });

  const shellClass = embedded
    ? "w-full"
    : "container mx-auto px-4 py-8 max-w-6xl";

  if (isLoading) {
    return (
      <div className="w-full py-10 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isError || !orderData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button onClick={() => router.push("/profile/orders")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const hasValidAppointment =
    orderData.appointment &&
    orderData.appointment.date &&
    orderData.appointment.time &&
    orderData.appointment.status;

  return (
    <div className={shellClass}>
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={() => (handlePrint as any)()}>
          <Printer className="w-4 h-4" /> Print Order
        </Button>
      </div>
      {!embedded && <MetaTagsProvider
        title={`Order Details - ${orderData.order._id}`}
        description={`View details of your order #${orderData.order._id}`}
        canonicalPath={`/order/${id}`}
        noindex={true}
      />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`space-y-6 ${
            hasValidAppointment ? "lg:col-span-2" : "lg:col-span-3"
          }`}
          ref={printRef}
        >
          {/* {order info card}  */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold break-all">
                Order #{orderData.order?.items?.[0]?.orderId}
              </h2>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  className={`${getStatusColor(
                    orderData.order.status,
                  )} whitespace-nowrap self-start sm:self-auto`}
                >
                  {orderData.order.status}
                </Badge>
                <p className="text-sm text-gray-500">
                  {getStatusDescription(orderData.order.status)}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(orderData.order.createdAt), "PPP")}
                  </p>
                </div>
              </div>
              {hasValidAppointment ? (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Appointment Time</p>
                    <p className="font-medium">
                      {format(new Date(orderData.appointment.date), "PPP")} at{" "}
                      {formatTimeTo12Hour(orderData.appointment.time)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CalendarX className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Appointment</p>
                    <p className="font-medium text-gray-600">Not Booked</p>
                  </div>
                </div>
              )}

              {orderData.order.status === OrderStatus.PAYMENT_PENDING && (
                <Button
                  className="md:hidden"
                  onClick={() => {
                    if (paymentCardRef.current) {
                      paymentCardRef.current.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  Make Payment
                </Button>
              )}
            </div>
          </Card>

          {/* Delivery Address Card */}
          {orderData.address && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
              <div className="space-y-1">
                <div>
                  {orderData.address.name} , {orderData.address.phone}
                </div>
                <div>{orderData.address.addressLine1}</div>
                {orderData.address.addressLine2 && (
                  <div>{orderData.address.addressLine2}</div>
                )}
                <div>
                  {orderData.address.city}, {orderData.address.state} -{" "}
                  {orderData.address.pincode}
                </div>
              </div>
            </Card>
          )}

          {/* {style details card}  */}
          <Card className="p-6">
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold mb-4">Style Details</h3>
              {user.role != UserRole.CUSTOMER && (
                <div>
                  <Button
                    onClick={() => {
                      setIsCusomizationsUpdateModalOpen(true);
                    }}
                  >
                    Update Customizations
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOptionsUpdateModalOpen(true);
                    }}
                    className="mx-2"
                  >
                    Update Options
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <div className="w-full lg:w-1/3">
                <ImagePreview
                  src={orderData.style.image}
                  alt={orderData.style.name}
                  className="h-48 sm:h-56 md:h-64 w-full rounded-lg object-cover"
                  showRemoveButton={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-medium mb-2 truncate">
                  {orderData.style.name}
                </h4>
                <p className="text-xl sm:text-2xl font-bold text-primary mb-4">
                  ₹{orderData.style.price.toLocaleString()}
                </p>
                <div className="flex flex-col gap-3 sm:gap-4">
                  {orderData.priceBreakup.customizations.map(
                    (customization, index) => (
                      <div
                        key={`${customization.title}-${index}`}
                        className="flex items-start gap-3"
                      >
                        {customization.image && (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                            <ImagePreview
                              src={customization.image}
                              alt={customization.title}
                              className="w-full h-full rounded-md object-cover object-top border border-gray-200"
                              imgClassName="object-top"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex items-start sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-gray-600 text-sm sm:text-base flex-1 min-w-0">
                              {customization.title}
                            </span>
                            {user.role != UserRole.CUSTOMER && (
                              <button
                                onClick={() => {
                                  const newPrice = prompt(
                                    "Enter new Price (optional): ",
                                  );

                                  removeCustomizationsAndOptions({
                                    order_Id: id,
                                    type: customization.type,
                                    optionId: customization.id,
                                    orderId:
                                      orderData.order?.items?.[0]?.orderId,
                                    ...(Number(newPrice) > 0 && {
                                      customPrice: Number(newPrice),
                                    }),
                                  });
                                }}
                              >
                                {isRemovingOrderOptions ? (
                                  <Loader2
                                    size={14}
                                    className="mx-3 animate-spin"
                                    color="red"
                                  />
                                ) : (
                                  <Trash2Icon
                                    size={14}
                                    className="mx-3"
                                    color="red"
                                  />
                                )}
                              </button>
                            )}
                          </div>
                          <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                            ₹{customization.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold">Reference Images</h3>
              </div>
              {user.role !== UserRole.CUSTOMER && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Neck", "Back-Neck", "Sleeves", "Fabric"].map((label) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        imageType.current = label;
                        setShowImagePicker(true);
                      }}
                      className="w-full text-sm"
                    >
                      Add {label} Image
                    </Button>
                  ))}
                </div>
              )}

              {/* Update Button */}
              {user.role !== UserRole.CUSTOMER && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      orderImagesUpdatemutation.mutate({
                        id,
                        add: uploadedImages,
                        remove: removedImages,
                      })
                    }
                    disabled={
                      removedImages.length === 0 && uploadedImages.length === 0
                    }
                    className="min-w-[220px]"
                  >
                    {orderImagesUpdatemutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `Update Images (${removedImages.length} Delete, ${uploadedImages.length} Add)`
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Image Grid */}
            {orderData.order.imageUrls.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {orderData.order.imageUrls.map((url, index) => {
                    const isSelected = removedImages.includes(url);

                    return (
                      <div key={url} className="space-y-2">
                        {user.role !== UserRole.CUSTOMER && (
                          <Button
                            size="sm"
                            variant={isSelected ? "secondary" : "destructive"}
                            onClick={() =>
                              setRemovedImages((prev) =>
                                prev.includes(url)
                                  ? prev.filter((img) => img !== url)
                                  : [...prev, url],
                              )
                            }
                            className="w-full"
                          >
                            {isSelected ? "Discard" : "Select to Remove"}
                          </Button>
                        )}

                        <p className="text-xs text-gray-600 truncate">
                          {new URL(url).pathname.split("/").pop().split("_")[0]}
                        </p>

                        <div
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden bg-gray-100",
                            isSelected && "opacity-70 ring-2 ring-red-500",
                          )}
                        >
                          <ImagePreview
                            src={url}
                            alt={`Reference image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2">Notes</h4>
              <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
                {orderData.order.notes}
              </div>
            </div>

            <MeasurementsTable measurements={orderData.measurements} />
          </Card>
        </div>

        <div
          className={`space-y-6 ${hasValidAppointment ? "" : "lg:col-span-3"}`}
        >
          {/* {appointmet details card}  */}
          <Card
            className="p-6"
            style={{
              display:
                orderData.order.status === OrderStatus.CANCELLED
                  ? "none"
                  : "block",
            }}
          >
            <h3 className="text-xl font-semibold mb-4">Appointment Status</h3>
            <div className="space-y-4">
              {hasValidAppointment ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge
                      className={getStatusColor(orderData.appointment.status)}
                    >
                      {orderData.appointment.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {format(new Date(orderData.appointment.date), "PPP")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">
                      {formatTimeTo12Hour(orderData.appointment.time)}
                    </span>
                  </div>
                  {orderData.appointment.notes && (
                    <>
                      <Separator />
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-yellow-800">
                            {orderData.appointment.notes}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CalendarX className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">No Appointment Booked</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Please book an appointment to proceed with your order
                  </p>
                  <Button
                    onClick={() => setShowAppointmentScheduler(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Details Card */}
          <Card
            className={`p-6 ${
              orderData?.order?.status === OrderStatus.CANCELLED
                ? "bg-red-50 cursor-not-allowed"
                : ""
            }`}
            style={{ display: !hasValidAppointment ? "none" : "block" }}
          >
            <div
              className="flex justify-between items-center mb-4"
              ref={paymentCardRef}
            >
              <h3 className="text-xl font-semibold">Payment Details</h3>
              {/* Move payment status to right side */}
              <Badge className={getStatusColor(orderData.appointment.status)}>
                {orderData.payment?.status || OrderStatus.PENDING}
              </Badge>
            </div>

            <div
              className={`space-y-4 ${
                orderData?.order?.status === OrderStatus.CANCELLED
                  ? "pointer-events-none"
                  : ""
              }`}
            >
              {orderData?.order?.status === OrderStatus.CANCELLED && (
                <Badge className="bg-red-500 text-white mb-4">
                  Order Cancelled
                </Badge>
              )}

              <Separator />

              <div className="space-y-3">
                {/* Show Order Total and Total Amount only if coupon applied */}
                {appliedCoupon ? (
                  <>
                    {/* Order Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium text-base">
                        Order Total
                      </span>
                      <span className="font-semibold text-lg">
                        ₹{orderData.priceBreakup.total.toLocaleString()}
                      </span>
                    </div>

                    {/* Coupon Applied */}
                    <div className="flex justify-between items-center text-green-600 text-sm italic font-normal">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Coupon Applied ({appliedCoupon.code})
                      </span>
                      <span className="font-normal ml-auto">
                        –₹{appliedCoupon.discount.toLocaleString()}
                      </span>
                    </div>

                    {/* Total Amount after discount */}
                    <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                      <span className="text-gray-800 font-semibold text-lg">
                        Total Amount
                      </span>
                      <span className="font-bold text-xl text-primary">
                        ₹
                        {(
                          orderData.priceBreakup.total - appliedCoupon.discount
                        ).toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  // No coupon applied, just show Total Amount
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium text-base">
                      Total Amount
                    </span>
                    <span className="font-semibold text-lg text-primary">
                      ₹{orderData.priceBreakup.total.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Payable Now (Pre-payment) with Tooltip */}
                <div className="mt-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 max-w-[75%]">
                    <span className="font-medium text-base">Payable Now</span>

                    {/* Tooltip "What’s this?" */}
                    <div className="relative group cursor-pointer text-xs text-gray-500">
                      <span className="underline underline-offset-2">
                        What’s this?
                      </span>
                      <div className="absolute z-20 top-full left-0 w-80 p-3 mt-1 text-xs bg-white border border-gray-200 rounded-md shadow-md text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <p className="mb-2">
                          A <strong>20%</strong> advance is collected now to
                          confirm your order.
                        </p>
                        <p className="mb-2">
                          The remaining <strong>80%</strong> will be payable
                          after successful delivery.
                        </p>
                        <p className="italic text-gray-500">
                          Coupon discounts apply to the total order value before
                          calculating the advance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className="font-semibold text-primary text-xl">
                    ₹
                    {Math.round(
                      (orderData.priceBreakup.total -
                        (appliedCoupon?.discount || 0)) *
                        0.2,
                    ).toLocaleString()}
                  </span>
                </div>

                {/* Helper Links */}
                <div className="flex w-max gap-4 mt-3">
                  <button
                    className="text-xs text-gray-700 hover:text-gray-900 border-b border-dashed border-gray-400 hover:border-gray-600 pb-0.5 transition-colors"
                    onClick={() => setShowPriceBreakdown(true)}
                  >
                    View Price Breakdown
                  </button>
                  <button
                    className="text-xs text-gray-700 hover:text-gray-900 border-b border-dashed border-gray-400 hover:border-gray-600 pb-0.5 transition-colors"
                    onClick={() => setShowEligibleCoupons(true)}
                    style={{
                      display: orderData.payment?._id ? "none" : "block",
                    }}
                  >
                    Available Coupons
                  </button>
                </div>

                {/* Coupon Input and Buttons */}
                {(!orderData.payment?.status ||
                  orderData.payment.status === "PENDING") && (
                  <>
                    <Separator />
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          disabled={!!appliedCoupon || isValidatingCoupon}
                          className="flex-1"
                        />
                        {!appliedCoupon ? (
                          <Button
                            onClick={() => validateCouponMutation(couponCode)}
                            disabled={isValidatingCoupon}
                            className="whitespace-nowrap"
                          >
                            {isValidatingCoupon ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={handleRemoveCoupon}
                            className="whitespace-nowrap"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Payment Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
                        onClick={handlePayment}
                      >
                        {false ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4 mr-2" />
                        )}
                        Proceed to Payment
                      </Button>

                      <Button
                        className="w-full hover:bg-red-400 hover:text-white"
                        onClick={() => cancelOrderMutation()}
                        variant="outline"
                      >
                        {isCancellingOrder && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Cancel Order
                      </Button>
                    </div>
                  </>
                )}

                {/* Payment Method Details */}
                {orderData.payment?.method && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium">
                          {orderData.payment.method}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-medium break-all text-right">
                          {orderData.payment._id}
                        </span>
                      </div>
                      {orderData.payment.createdAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Paid On</span>
                          <span className="font-medium">
                            {format(
                              new Date(orderData.payment.createdAt),
                              "PPP",
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* appointment booking dialog */}
      {showAppointmentScheduler && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-end items-center mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAppointmentScheduler(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AppointmentScheduler
                onScheduleAppointment={handleScheduleAppointment}
                orderDetails={orderData.order}
                // showAddressSelector={!isScheduledCall}
              />
            </div>
          </div>
        </div>
      )}

      <EligibleCoupons
        isOpen={showEligibleCoupons}
        onClose={() => setShowEligibleCoupons(false)}
      />

      <PriceBreakdownPopup
        showPopup={showPriceBreakdown}
        onClose={() => setShowPriceBreakdown(false)}
        priceBreakup={orderData.priceBreakup}
        couponCode={appliedCoupon?.code}
        couponValue={appliedCoupon?.discount || 0}
      />

      <UpdateOrderCustomizations
        orderId={id}
        isOpen={isUpdateCusomizationsModalOpen}
        onOpenChange={(val) => {
          setIsCusomizationsUpdateModalOpen(val);
        }}
        onSuccess={() => {
          refetch();
          setIsCusomizationsUpdateModalOpen(false);
        }}
      />

      <UpdateOrderOptions
        orderId={id}
        isOpen={isUpdateOptionsModalOpen}
        onOpenChange={(val) => {
          setIsOptionsUpdateModalOpen(val);
        }}
        onSuccess={() => {
          refetch();
          setIsOptionsUpdateModalOpen(false);
        }}
      />

      {showImagePicker && (
        <MultiImageBookingModal
          open={showImagePicker}
          onOpenChange={setShowImagePicker}
          onImageSelect={(urls) => {
            setUploadedImageUrls((prev) => {
              const uniqueImages = [...new Set([...prev, ...urls])];
              console.log(urls);
              return uniqueImages;
            });
          }}
          onClose={() => setShowImagePicker(false)}
          alreadySelectedImages={uploadedImages}
          onRemoveImage={(url) => {
            setUploadedImageUrls((prev) => prev.filter((img) => img !== url));
          }}
          type={imageType.current || id}
          isPreviewMode={true}
        />
      )}
    </div>
  );
};

export default OrderDetailsPage;
