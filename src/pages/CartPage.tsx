import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clearCart, getCart, removeFromCart } from "@/lib/cart";
import { CartItem, InvoiceData } from "@/types/interface";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { CartCheckout } from "@/components/admin/modals/CartCheckout";
import { apiFetch } from "@/hooks/interceptor";
import { cartCheckoutApi } from "@/services/modules/orders.api";
import { useMutation } from "@tanstack/react-query";
import { generateErrorMessage } from "@/lib/helpers";
import { formatDate } from "@/components/customization/AppointmentScheduler";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services";
import { downloadInvoicePDF } from "@/lib/downloadInvoicePdf";
import { useRouter } from "@/lib/next-router-compat";

const EmptyCartState = () => {
  const navigate = useRouter();
  const router = navigate;
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        Looks like you haven't added any styles to your cart yet. Browse our
        collection and find your perfect style!
      </p>
      <Button
        variant="default"
        className="gap-2"
        onClick={() => router.push("/")}
      >
        Browse Styles
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const CartPage: React.FC = () => {
  const navigate = useRouter();
  const router = navigate;
  const { toast } = useToast();
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [isCartOpened, setIsCartOpened] = useState(false);
  const { user } = useAuth();
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  useEffect(() => {
    const cartItems = getCart();
    setLocalCartItems(cartItems);
  }, []);

  const handleRemoveFromCart = (timestamp: string) => {
    const updatedCart = removeFromCart(timestamp);
    setLocalCartItems(updatedCart);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

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
      clearCart();
      setLocalCartItems([]);
      localStorage.removeItem("session_body_measurements");
      localStorage.removeItem("customerPhone");
      localStorage.removeItem("pickupId");
      // setIsCartOpened(false);
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
    const { advance_collected, extra_items, ...customerData } = data;
    const payload = {
      orderItems: [],
      customerData: {
        ...customerData,
        date: formatDate(new Date(customerData.date)),
      },
    };
    localCartItems.forEach((item) => {
      payload.orderItems.push(item.orderData);
    });

    await checkoutCart(payload);

    setIsGeneratingInvoice(true);
    const invoiceCustomer = {
      name: customerData.name ?? "",
      addressLine1: customerData.addressLine1,
      addressLine2: customerData.addressLine2 ?? "",
      addressLine3: `${customerData.city} ${customerData.pincode}, ${customerData.state}`,
      phone: customerData.phone,
    };

    const cartTotal = localCartItems.reduce((sum, item) => {
      const price = item.orderData.customPrice
        ? Number(item.orderData.customPrice)
        : Number(item?.price);
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
      ...localCartItems.map((item) => ({
        name: item.name,
        unitCost: item.orderData.customPrice
          ? Number(item.orderData.customPrice)
          : Number(item?.price),
        qty: 1,
      })),
    ];

    const rawInvoiceNo = localCartItems
      .map((item) => item.orderData.items.orderId)
      .join("_");

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
    setIsCartOpened(false);
  };

  const renderLocalCartSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Your Cart</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Items in your cart will auto-clear in 30 days
            </p>
          </div>
          {user && user.role != UserRole.CUSTOMER && (
            <Button
              className="relative bg-[#147080] hover:bg-[#115c69] text-white font-semibold px-6 py-2 rounded-full"
              onClick={() => {
                setIsCartOpened(true);
              }}
              disabled={localCartItems.length === 0}
            >
              Checkout
              {localCartItems.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-white text-[#147080] text-xs font-bold px-2 py-0.5">
                  {localCartItems.length}
                </span>
              )}
            </Button>
          )}
        </div>

        {localCartItems.length === 0 ? (
          <EmptyCartState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {localCartItems.map((item) => (
              <Card
                key={item.productImage}
                className="overflow-hidden hover:shadow-md transition-shadow duration-200 w-full max-w-sm mx-auto"
              >
                <div className="relative">
                  <div className="aspect-square w-full">
                    <img
                      src={
                        item.productImage ||
                        item.imageUrls?.[0] ||
                        "/placeholder.png"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item.timestamp)}
                    className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 bg-white/80 backdrop-blur-sm rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-primary">
                      ₹
                      {item.orderData.customPrice
                        ? item.orderData.customPrice.toLocaleString()
                        : item?.price.toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={item.returnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[100%] text-sm sm:text-base py-2 sm:py-2.5 bg-primary text-white rounded-md px-4"
                  >
                    Complete Order
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <MetaTagsProvider
        title="Your Cart | SilaiGo"
        description="Review your items and proceed to checkout for doorstep tailoring."
        canonicalPath="/cart"
        noindex={true}
      />
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Review your selected styles and complete your order
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto text-sm"
            onClick={() => router.push("/profile/orders")}
          >
            View Pending Orders
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {renderLocalCartSection()}
      </div>

      <CartCheckout
        isOpen={isCartOpened}
        onOpenChange={(val) => {
          setIsCartOpened(val);
        }}
        onSubmit={checkout}
        isSubmitting={isPlacingOrder || isGeneratingInvoice}
      />
    </div>
  );
};

export default CartPage;
