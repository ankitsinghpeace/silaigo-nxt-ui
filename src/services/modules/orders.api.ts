import { apiFetch } from "@/hooks/interceptor";
import { CreatePickupPayload } from "@/types/interface";

export const getAndUpdateOrderId = async (
  categoryId: string,
  subCategoryName: string,
) => {
  console.log(categoryId);
  console.log(subCategoryName);
  const response = await apiFetch<any>(
    `orders/next-order-id/${encodeURIComponent(
      categoryId,
    )}/${encodeURIComponent(subCategoryName)}`,
    {
      method: "GET",
      auth: true,
    },
  );
  return response.data;
};

export const placeOrderApi = async (orderData: any) => {
  const response = await apiFetch<any>("orders", {
    method: "POST",
    body: orderData,
    auth: true,
  });
  return response.data;
};

export const copyOrderApi = async (orderId: string) => {
  const response = await apiFetch<any>("orders/duplicate", {
    method: "POST",
    body: { id: orderId },
    auth: true,
  });
  return response.data;
};

export const placeAdminOrderApi = async (orderData: any) => {
  const response = await apiFetch<any>("orders/admin", {
    method: "POST",
    body: orderData,
    auth: true,
  });
  return response.data;
};

export const cartCheckoutApi = async (orderData: any) => {
  const response = await apiFetch<any>("orders/admin-cart", {
    method: "POST",
    body: orderData,
    auth: true,
  });
  return response.data;
};

export const getOrderByIdApi = async (id: string) => {
  const response = await apiFetch<any>(`orders/${id}`, {
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const getOrdersByUserIdApi = async (
  page: number = 1,
  limit: number = 10,
) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  const url = `orders?${params.toString()}`;
  const response = await apiFetch<any>(url, {
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const createRazorpayOrderApi = async (
  internalOrderId: string,
  couponCode: string,
) => {
  const response = await apiFetch<any>("orders/initiate-payment", {
    method: "POST",
    body: { internalOrderId, couponCode },
    auth: true,
  });
  return response.data;
};

export const verifyRazorpayPaymentApi = async (body: any) => {
  const response = await apiFetch<any>(`orders/verify-payment`, {
    method: "POST",
    body,
    auth: true,
  });
  return response.data;
};

export const getAllOrders = async (searchParams: any) => {
  const res = await apiFetch<any>(
    `orders/all?${new URLSearchParams(searchParams).toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );
  return res.data;
};

export const getRoleOrderOptions = async (orderId: string) => {
  const res = await apiFetch<any>(`events-options?orderId=${orderId}`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const addMicroEventToTimeLine = async (payload: any) => {
  const res = await apiFetch<any>(`events-options`, {
    method: "POST",
    auth: true,
    body: payload,
  });
  return res.data;
};

export const getMicroTaskTimeLine = async (orderId: string) => {
  const res = await apiFetch<any>(`events-options/timeline/${orderId}`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const updateOrderStatusApi = async (orderId: string, status: string) => {
  const res = await apiFetch<any>(`orders/${orderId}/status`, {
    method: "PUT",
    body: { status },
    auth: true,
  });
  return res.data;
};

export const updateOrderTimeLineApi = async (
  orderId: string,
  status: string,
) => {
  const res = await apiFetch<any>(`orders/${orderId}/timeline`, {
    method: "PUT",
    body: { status },
    auth: true,
  });
  return res.data;
};

export const updateOrderMeasurementsApi = async (
  orderId: string,
  details: any,
) => {
  const res = await apiFetch<any>(`orders/${orderId}/measurements`, {
    method: "PUT",
    body: { details },
    auth: true,
  });
  return res.data;
};

export const cancelOrderApi = async (orderId: string) => {
  const res = await apiFetch<any>(`orders/${orderId}/cancel`, {
    method: "PUT",
    auth: true,
  });
  return res.data;
};

export const removeCustomizationsOrOptionsApi = async (data: any) => {
  const res = await apiFetch<any>(`orders/update/remove`, {
    method: "Put",
    auth: true,
    body: data,
  });
  return res.data;
};

export const updateOrderStatusBulkApi = async (data: any) => {
  const res = await apiFetch<any>(`orders/update/bulk`, {
    method: "Put",
    auth: true,
    body: data,
  });
  return res.data;
};

export const addCustomizationsApi = async (data: any) => {
  const res = await apiFetch<any>(`orders/update/add-customizations`, {
    method: "Put",
    auth: true,
    body: data,
  });
  return res.data;
};

export const updateOrdersImagesApi = async (data: any) => {
  const res = await apiFetch<any>(`orders/update/images/${data.id}`, {
    method: "Put",
    auth: true,
    body: data,
  });
  return res.data;
};

export const updateOrdersProcessingState = async (id: string, data: any) => {
  const res = await apiFetch<any>(`orders/update/processing-state/${id}`, {
    method: "Put",
    auth: true,
    body: data,
  });
  return res.data;
};

export const assignStitchingAgent = async (id: string, data: any) => {
  const res = await apiFetch<any>(`orders/update/stitching-agent/${id}`, {
    method: "Put",
    auth: true,
    body: data,
  });
  return res.data;
};

export const addToPinnedOrders = async (id: string, data: any) => {
  const res = await apiFetch<any>(`orders/update/pin/${id}`, {
    method: "Put",
    auth: true,
    body: data,
  });
  return res.data;
};

export const createCouponData = async (data: any) => {
  const res = await apiFetch<any>(`meta-master/coupons`, {
    method: "POST",
    body: data,
    auth: true,
  });
  return res.data;
};

export const updateCouponData = async (data: any, id: string) => {
  const res = await apiFetch<any>(`meta-master/coupons/${id}`, {
    method: "PUT",
    body: data,
    auth: true,
  });
  return res.data;
};

export const deleteCouponData = async (id: string) => {
  const res = await apiFetch<any>(`meta-master/coupons/${id}`, {
    method: "DELETE",
    auth: true,
  });
  return res.data;
};

export const validateCouponApi = async ({
  couponCode,
  orderAmount,
}: {
  couponCode: string;
  orderAmount: number;
}) => {
  const res = await apiFetch<any>(`meta-master/coupons/validate`, {
    method: "POST",
    body: { couponCode, amount: orderAmount },
    auth: true,
  });
  return res.data;
};

export const getEligibleCouponsApi = async () => {
  const res = await apiFetch<any>(`meta-master/coupons/eligible`, {
    method: "GET",
    auth: true,
  });
  console.log(res.data);
  return res.data.couponList;
};

export const createPickupApi = async (body: CreatePickupPayload) => {
  const res = await apiFetch<any>(`orders/pickup`, {
    method: "POST",
    auth: true,
    body,
  });
  return res.data;
};

export const getPickupApi = async () => {
  const res = await apiFetch<any>(`orders/pickup`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const updatePickupOptionsApi = async (
  pickupId: string,
  options: { label: string; value: boolean }[],
) => {
  console.log(pickupId);
  const res = await apiFetch<any>(`orders/pickup/${pickupId}/options`, {
    method: "PATCH",
    auth: true,
    body: options,
  });
  return res.data;
};

export const updatePickupDetailsApi = async (
  pickupId: string,
  details: any,
) => {
  const res = await apiFetch<any>(`orders/pickup/${pickupId}/details`, {
    method: "PATCH",
    auth: true,
    body: details,
  });
  return res.data;
};

export const getPickupByIdApi = async (id: string) => {
  const res = await apiFetch<any>(`orders/pickup/${id}`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const getAddressViaPhone = async (phone: string) => {
  const res = await apiFetch<any>(`address/phone/${phone}`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

/**
 * Sends a customer-facing status update SMS (via MSG91 on the backend).
 *
 * PENDING BACKEND: `POST /orders/:id/notify` does not exist yet — see
 * BACKEND_CHANGES_NEEDED.md. Once added, this call starts working with no
 * frontend changes required.
 */
export const notifyOrderApi = async (
  orderId: string,
  stage: "picked_up" | "ready" | "dispatched" | "delivered",
) => {
  const res = await apiFetch<any>(`orders/${orderId}/notify`, {
    method: "POST",
    body: { stage },
    auth: true,
  });
  return res.data;
};

/**
 * Returns an order for alteration: assigns a tailor + internal urgency
 * (1=Immediate, 2=Priority, 3=Normal) and triggers the mandatory
 * "Returned for Alteration" customer WhatsApp message on the backend.
 *
 * PENDING BACKEND: `POST /orders/:id/alteration` does not exist yet — see
 * be_changes2.md.
 */
export const returnForAlterationApi = async (
  orderId: string,
  data: { tailorId: string; urgency: "1" | "2" | "3" },
) => {
  const res = await apiFetch<any>(`orders/${orderId}/alteration`, {
    method: "POST",
    body: data,
    auth: true,
  });
  return res.data;
};

/**
 * Manually sends the customer a review-request link. Never triggered
 * automatically on Delivered — the Pickup Agent decides.
 *
 * PENDING BACKEND: `POST /orders/:id/review-link` does not exist yet — see
 * be_changes2.md.
 */
export const sendReviewLinkApi = async (orderId: string) => {
  const res = await apiFetch<any>(`orders/${orderId}/review-link`, {
    method: "POST",
    auth: true,
  });
  return res.data;
};

/**
 * Public (no-auth) order tracker for the homepage "Track Your Order"
 * widget. Must return ONLY customer-safe fields — no assignee names, no
 * urgency, no internal timestamps/notes.
 *
 * PENDING BACKEND: `GET /orders/track/:orderId` does not exist yet — see
 * be_changes2.md.
 */
export const trackOrderPublicApi = async (orderId: string) => {
  const res = await apiFetch<any>(`orders/track/${encodeURIComponent(orderId)}`, {
    method: "GET",
    auth: false,
  });
  return res.data;
};
