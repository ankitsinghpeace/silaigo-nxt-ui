"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  assignStitchingAgent,
  copyOrderApi,
  getAllOrders,
  updateOrderMeasurementsApi,
  addToPinnedOrders,
  updateOrdersProcessingState,
  updateOrderStatusApi,
  updateOrderTimeLineApi,
  updateOrderStatusBulkApi,
} from "@/services/modules/orders.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar as CalendarIcon2,
  DollarSign,
  Trash,
  Loader2,
  RulerIcon,
  PencilIcon,
  Repeat,
} from "lucide-react";
import { generateErrorMessage } from "@/lib/helpers";
import {
  OrderProcessingState,
  OrderStatus,
  OrderTimeLine,
  PaymentStatus,
  PermissionSubType,
  PermissionType,
} from "@/types/enums";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@radix-ui/react-dialog";
import { deleteOrder, getTeamMembersViaRole, UserRole } from "@/services";
import OrderTimelineView from "@/components/OrderTImeLineView";
import { json2csv } from "json-2-csv";
import Swal from "sweetalert2";
import { tailoringDetails } from "@/services/constants";
import { MeasurementsModal } from "@/components/admin/modals/MeasurementsModal";
import EventsOptions from "@/components/admin/EventsOptions";
import { CreatePickupDialog } from "@/components/admin/CreatePickupDialog";
import { TabsContent } from "@radix-ui/react-tabs";
import PickupsPage from "@/components/admin/PickupsPage";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "@/lib/next-router-compat";

const SEARCH_FIELDS = [
  { value: "orderId", label: "Order ID" },
  { value: "customerName", label: "Customer Name" },
  { value: "customerPhone", label: "Customer Phone" },
  { value: "customerEmail", label: "Customer Email" },
  { value: "couponCode", label: "Coupon Code" },
  { value: "productName", label: "Product Name" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const LIMIT_OPTIONS = [
  { value: "20", label: "20" },
  { value: "30", label: "30" },
  { value: "40", label: "40" },
  { value: "50", label: "50" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "any", label: "Any Status" },
  { value: OrderStatus.PENDING, label: "Booking Pending  " },
  { value: OrderStatus.PLACED, label: "Order Placed   " },
  { value: OrderStatus.PAYMENT_PENDING, label: "Payment Pending" },
  { value: OrderStatus.PAYMENT_DONE, label: "Payment Done" },
  { value: OrderStatus.COMPLETED, label: "Order Completed " },
  { value: OrderStatus.CANCELLED, label: "Order Cancelled" },
];

export const ORDER_TIMELINE_OPTIONS = [
  {
    value: OrderProcessingState.ORDER_INITIATED,
    label: "Order Initiated",
  },
  {
    value: OrderProcessingState.ORDER_PLACED,
    label: "Order Placed",
  },
  {
    value: OrderProcessingState.MATERIAL_DELIVERED_TO_WORKSHOP,
    label: "Material Delivered to Workshop",
  },
  {
    value: OrderProcessingState.ORDER_FULFILLED,
    label: "Order Fulfilled",
  },
  {
    value: OrderProcessingState.CUTTING_END,
    label: "Cutting Completed",
  },
  {
    value: OrderProcessingState.STITCHING_END,
    label: "Stitching Completed",
  },
  {
    value: OrderProcessingState.ORDER_COMPLETE,
    label: "Order Completed",
  },
];

const ORDER_STATUS_OPTIONS_FOR_EDIT = [
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

const getPaymentStatusBadgeColor = (status: string) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle,
      };
    case PaymentStatus.FAILED:
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
      };
    case PaymentStatus.REFUNDED:
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: DollarSign,
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: DollarSign,
      };
  }
};

const getPaymentStatusDisplayText = (status: string) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return "Success";
    case PaymentStatus.FAILED:
      return "Failed";
    case PaymentStatus.REFUNDED:
      return "Refunded";
    default:
      return status || "N/A";
  }
};

const getAppointmentStatusBadgeColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "BOOKED":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: CalendarIcon2,
      };
    case "COMPLETED":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle,
      };
    case "CANCELLED":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: CalendarIcon2,
      };
  }
};

function openTailoringPage() {
  localStorage.clear();
  const url = `${window.location.origin}/tailoring`;
  const margin = 50;
  const width = window.screen.width - margin * 2;
  const height = window.screen.height - margin * 2;

  const left = margin;
  const top = margin;

  window.open(
    url,
    "TailoringWindow",
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
  );
}

const OrdersPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "customer">("customer");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const toggleCustomerExpanded = (id: string) =>
    setExpandedCustomers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const openOrderModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedOrderIds(allOrderIds);
    else setSelectedOrderIds([]);
  };

  const handleSelectRow = (orderId: string, checked: boolean) => {
    if (checked) setSelectedOrderIds((prev) => [...prev, orderId]);
    else setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
  };
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrderIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      // Replace with your actual bulk API call
      await updateOrderStatusBulkApi({ selectedOrderIds, bulkStatus });
      setSelectedOrderIds([]);
      setBulkStatus("");
      refetchOrders();
      toast({
        title: "Bulk status updated",
        description: "Selected orders updated successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Bulk update failed",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    }
    setIsBulkUpdating(false);
  };
  const router = useRouter();
  const searchParams = router.query;
  const setSearchParams = (params: Record<string, string>) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...params,
      },
    });
  };
  const [searchField, setSearchField] = useState(SEARCH_FIELDS[0].value);
  const [searchValue, setSearchValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { user } = useAuth();
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [tab, setTab] = useState<"orders" | "pickups">("orders");
  const orderToEditMeasurement = useRef<string | null>(null);
  const [orderExistingMeasurementData, setOrderExistingMeasurementData] =
    useState({});

  // Set initial tab based on user role
  useEffect(() => {
    if (user) {
      setTab(user.role === UserRole.PICKUP_COORDINATOR ? "pickups" : "orders");
    }
  }, [user]);

  const { toast } = useToast();
  const canView =
    user?.permissions?.includes(
      `${PermissionType.ORDER}.${PermissionSubType.VIEW}`,
    ) ||
    user?.permissions?.includes(
      `${PermissionType.APPOINTMENTS}.${PermissionSubType.VIEW}`,
    );
  const canEdit = user?.permissions?.includes(
    `${PermissionType.ORDER}.${PermissionSubType.EDIT}`,
  );

  // show oldest order 1st in came oF roles other than admin
  useEffect(() => {
    // if (user.role != UserRole.ADMIN) {
    //   const newParams = new URLSearchParams(searchParams);
    //   newParams.set("sortByDeliveryDate", "1");
    //   setSearchParams(newParams);
    // }

    if (user?.role === UserRole.CUTTING) {
      setSearchParams({
        startDate: "2026-02-05",
        sortBy: "oldest",
      });
    }
  }, []);

  // Don't render if user is not loaded yet
  if (!user) {
    return null;
  }

  // Get active filters directly from searchParams
  const activeFilters = SEARCH_FIELDS.filter((field) =>
    searchParams[field.value],
  ).map((field) => ({
    field: field.value,
    value: searchParams[field.value]!,
    label: field.label,
  }));

  const handleSearch = () => {
    if (!searchValue.trim()) return;

    setSearchParams({
      [searchField]: searchValue,
      page: "1",
    });
    setSearchValue("");
  };

  const removeParam = (field: string) => {
    const newQuery = { ...router.query };
    delete newQuery[field];
    newQuery.page = "1";
    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const clearAllFilters = () => {
    const newQuery: Record<string, string> = { page: "1" };
    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const handlePagination = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const {
    data,
    isPending,
    isError,
    error: fetchError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", searchParams.toString()],
    queryFn: () => {
      if (!canView) {
        return Promise.reject(
          new Error("You don't have permission to view orders"),
        );
      }
      return getAllOrders(searchParams.toString());
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  // Open confirmation modal and store order id to delete
  const openConfirm = (id) => {
    setOrderToDelete(id);
    setConfirmOpen(true);
  };

  // Close modal without deleting
  const closeConfirm = () => {
    setConfirmOpen(false);
    setOrderToDelete(null);
  };

  const {
    mutate: deleteOrderMutation,
    isPending: isDeletingOrder,
    isError: isDeletingOrderError,
    error: deletingOrderError,
  } = useMutation({
    mutationFn: (orderId: string) => {
      if (!orderId) {
        toast({
          title: "No order ID",
          description: "Cannot delete: No order ID provided.",
          variant: "destructive",
        });
        return Promise.reject(new Error("No order ID provided"));
      }

      return deleteOrder(orderId);
    },
    onSuccess: (res, orderId) => {
      //refetchOrders();
      queryClient.setQueryData(
        ["orders", searchParams.toString()],
        (oldData: any) => {
          if (!oldData) {
            return oldData;
          }

          const updatedData = oldData.orders.filter((order) => {
            return order.id != orderId;
          });

          return { ...oldData, orders: updatedData };
        },
      );

      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted",
      });
      closeConfirm();
    },
    onError: (error) => {
      toast({
        title: "Error deleting order",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteOrderMutation(orderToDelete); // Pass the single order ID
  };

  const orders = data?.orders || [];
  const pinnedOrders = data?.pinnedOrderList || [];

  const pagination = data?.pagination;

  // Bulk select helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrderIds = orders.map((order: any) => order.id);
  const isAllSelected =
    orders.length > 0 && selectedOrderIds.length === orders.length;
  const isIndeterminate =
    selectedOrderIds.length > 0 && selectedOrderIds.length < orders.length;

  // Group orders by customer
  const groupedOrders = useMemo(() => {
    if (!orders) return [];

    const grouped = orders.reduce((acc: any, order: any) => {
      const customerKey = order.customerId || order.customerName;
      if (!acc[customerKey]) {
        acc[customerKey] = {
          customerId: customerKey,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          orders: [],
          totalAmount: 0,
          totalItems: 0,
          paidCount: 0,
          pendingPaymentCount: 0,
          completedCount: 0,
          nextDelivery: null as string | null,
        };
      }
      const bucket = acc[customerKey];
      bucket.orders.push(order);
      bucket.totalItems += 1;
      bucket.totalAmount += order.productPrice || 0;
      if (order.paymentStatus === PaymentStatus.SUCCESS) bucket.paidCount += 1;
      else bucket.pendingPaymentCount += 1;
      if (order.orderStatus === OrderStatus.COMPLETED) bucket.completedCount += 1;
      if (order.appointmentDate) {
        if (
          !bucket.nextDelivery ||
          new Date(order.appointmentDate) < new Date(bucket.nextDelivery)
        ) {
          bucket.nextDelivery = order.appointmentDate;
        }
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }, [orders]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return (
      (orders || []).find((o: any) => o.id === selectedOrderId) ||
      (pinnedOrders || []).find((o: any) => o.id === selectedOrderId) ||
      null
    );
  }, [selectedOrderId, orders, pinnedOrders]);



  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => {
      if (!canEdit) {
        return Promise.reject(
          new Error("You don't have permission to update order status"),
        );
      }
      return updateOrderStatusApi(orderId, status);
    },
    onSuccess: (res, { orderId, status }) => {
      // refetchOrders();

      queryClient.setQueryData(
        ["orders", searchParams.toString()],
        (oldData: any) => {
          if (!oldData) {
            return oldData;
          }

          const updatedData = oldData.orders.map((order) => {
            return order.id === orderId
              ? { ...order, orderStatus: status, timeLine: res.timeLine }
              : order;
          });

          return { ...oldData, orders: updatedData };
        },
      );
      toast({
        title: "Order status updated successfully",
        description: "The order status has been updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating order status",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: false,
  });

  const { mutate: updateOrderProcessingState } = useMutation({
    mutationFn: ({
      orderId,
      nextState,
    }: {
      orderId: string;
      nextState: string;
    }) => {
      if (!canEdit) {
        return Promise.reject(
          new Error("You don't have permission to update order status"),
        );
      }
      return updateOrdersProcessingState(orderId, { nextState });
    },
    onSuccess: (res, { orderId, nextState }) => {
      // refetchOrders();
      queryClient.setQueryData(
        ["orders", searchParams.toString()],
        (oldData: any) => {
          if (!oldData) {
            return oldData;
          }

          const updatedData = oldData.orders.map((order) => {
            return order.id === orderId
              ? {
                  ...order,
                  orderProcessingState: nextState,
                  timeLine: res.timeLine,
                }
              : order;
          });

          return { ...oldData, orders: updatedData };
        },
      );
      toast({
        title: "Order status updated successfully",
        description: "The order status has been updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating order status",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: false,
  });

  const { mutate: updateMeasurements, isPending: updatingMeasurements } =
    useMutation({
      mutationFn: ({
        details,
      }: {
        details: {
          optionsData?: {
            category: string;
            [key: string]: string | number;
          };
          bodyMeasurement?: {
            category: string;
            [key: string]: string | number;
          };
        };
      }) => {
        if (!canEdit) {
          return Promise.reject(
            new Error("You don't have permission to update order status"),
          );
        }

        const combinedDetails = {
          ...(details?.optionsData ? { optionsData: details.optionsData } : {}),
          ...(details?.bodyMeasurement
            ? { bodyMeasurement: details.bodyMeasurement }
            : {}),
        };

        return updateOrderMeasurementsApi(
          orderToEditMeasurement.current,
          combinedDetails,
        );
      },

      onSuccess: (res) => {
        queryClient.setQueryData(
          ["orders", searchParams.toString()],
          (oldData: any) => {
            if (!oldData) {
              return oldData;
            }

            const updatedData = oldData.orders.map((order) => {
              return order.id === orderToEditMeasurement.current
                ? { ...order, measurements: res.measurements }
                : order;
            });

            return { ...oldData, orders: updatedData };
          },
        );
        setIsMeasurementModalOpen(false);
        toast({
          title: "Order measurements updated successfully",
          description: "The order mesaurements has been updated successfully",
          variant: "default",
        });
      },
      onError: (error) => {
        toast({
          title: "Error updating order status",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
      retry: false,
    });

  const handleTabChange = (tab: "orders" | "pickups") => {
    if (tab === "orders") {
      const newQuery = { ...router.query };
      delete newQuery.all_orders;
      router.push({ pathname: router.pathname, query: newQuery });
    }
    setTab(tab);
  };

  async function fetchOrdersPage(
    page: number,
  ): Promise<{ orders: any[]; pagination: any }> {
    const startDate = searchParams.startDate;
    const endDate = searchParams.endDate;
    const query = new URLSearchParams();
    query.set("page", page.toString());

    if (startDate && endDate) {
      query.set("startDate", startDate);
      query.set("endDate", endDate);
    }
    const data = await getAllOrders(query.toString());
    return data;
  }

  const exportAllOrders = async () => {
    setIsExporting(true);
    let currentPage = 1;
    let allData: any[] = [];
    let hasNext = true;

    while (hasNext) {
      try {
        const data = await fetchOrdersPage(currentPage);
        allData = [...allData, ...(data.orders || [])];

        if (data.pagination?.hasNextPage) {
          currentPage = data.pagination.nextPage;
        } else {
          hasNext = false;
        }
      } catch (error) {
        console.error("Error fetching orders page:", error);
        hasNext = false;
      }
    }

    const options = {
      delimiter: {
        field: ",",
        wrap: '"',
        eol: "\n",
      },
      expandNestedObjects: true,
      expandArrayObjects: true,
      unwindArrays: true,
      useDateIso8601Format: true,
      escapeHeaderNestedDots: false,
      excludeKeys: ["timeLine"],
      checkSchemaDifferences: false,
      sortHeader: true,
      prependHeader: true,
      trimHeaderFields: true,
      trimFieldValues: true,
      preventCsvInjection: true,
    };

    try {
      const csv = await json2csv(allData, options);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "orders_export_silaigo.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
      alert("CSV generation failed:");
    }
    setIsExporting(false);
  };

  // duplicate a order
  const {
    mutate: duplicateOrderMutation,
    isPending: isCopyingOrder,
    isError: isCopyOrderError,
    error: copyingOrderError,
  } = useMutation({
    mutationFn: (orderId: string) => {
      if (!orderId) {
        toast({
          title: "No order ID",
          description: "Cannot delete: No order ID provided.",
          variant: "destructive",
        });
        return Promise.reject(new Error("No order ID provided"));
      }

      return copyOrderApi(orderId);
    },
    onSuccess: (res, orderId) => {
      refetchOrders();
      toast({
        title: "Order copied",
        description: "The order has been successfully copied",
      });
    },
    onError: (error) => {
      toast({
        title: "Error copying order",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  // pin order
  const { mutate: pinOrder, isPending: isUpdatingPin } = useMutation({
    mutationFn: ({
      orderId,
      isPinned,
      pinPosition,
    }: {
      orderId: string;
      isPinned: boolean;
      pinPosition: number | null;
    }) => {
      if (!canEdit) {
        return Promise.reject(
          new Error("You don't have permission to update order rank"),
        );
      }
      return addToPinnedOrders(orderId, { isPinned, pinPosition });
    },
    onSuccess: (res, { orderId, isPinned, pinPosition }) => {
      queryClient.setQueryData(
        ["orders", searchParams.toString()],
        (oldData: any) => {
          refetchOrders();
          if (!oldData) {
            return oldData;
          }

          const updatedData = oldData.orders.map((order: any) => {
            return order.id === orderId
              ? { ...order, isPinned, pinPosition }
              : order;
          });

          return { ...oldData, orders: updatedData };
        },
      );
      toast({
        title: "Order rank updated successfully",
        description: "The order rank has been updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error while pin order",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: false,
  });

  // team members via role
  const { data: teamMembersViaRole, error: teamMembersViaRoleError } = useQuery(
    {
      queryKey: ["teamMembers"],
      queryFn: () => {
        return getTeamMembersViaRole(UserRole.STITCHING);
      },
      retry: 2,
      retryDelay: 1000,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
    },
  );

  // assign stitching agent
  const {
    mutate: assignOrderToStitchingAgent,
    isPending: isAssigningToStitchingAgent,
    variables: assignOrderToStitchingAgentVariables,
  } = useMutation({
    mutationFn: ({
      orderId,
      agentId,
    }: {
      orderId: string;
      agentId: string;
    }) => {
      if (!canEdit) {
        return Promise.reject(new Error("You don't have permission to update"));
      }
      return assignStitchingAgent(orderId, { agentId });
    },
    onSuccess: (res, { orderId, agentId }) => {
      queryClient.setQueryData(
        ["orders", searchParams.toString()],
        (oldData: any) => {
          if (!oldData) {
            return oldData;
          }

          const updatedData = oldData.orders.map((order: any) => {
            return order.id === orderId
              ? { ...order, assignedToStitchingAgentId: agentId }
              : order;
          });

          return { ...oldData, orders: updatedData };
        },
      );
      toast({
        title: "Stitching agent assigned successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating order rank",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: false,
  });

  return (
    <AdminLayout>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
          <DialogContent className="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 bg-white p-10 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={closeConfirm}
                className="bg-none"
              >
                No
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="bg-red-500 text-white"
              >
                Yes
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and view customer orders
          </p>
        </div>

        {fetchError && (
          <div className="text-red-500 text-center">
            Error: {generateErrorMessage(fetchError)}
          </div>
        )}

        <div className="p-6 border border-dashed rounded-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 mb-2 items-end">
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Order Status
                </label>
                <Select
                  value={searchParams.orderStatus || "any"}
                  onValueChange={(val) => {
                    if (val === "any") {
                      const newQuery = { ...router.query };
                      delete newQuery.orderStatus;
                      newQuery.page = "1";
                      router.push({ pathname: router.pathname, query: newQuery });
                    } else {
                      setSearchParams({ orderStatus: val, page: "1" });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Sort By
                </label>
                <Select
                  value={searchParams.sortBy || "newest"}
                  onValueChange={(val) => {
                    setSearchParams({ sortBy: val, page: "1" });
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Limit
                </label>
                <Select
                  value={searchParams.limit || "20"}
                  onValueChange={(val) => {
                    setSearchParams({ limit: val, page: "1" });
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIMIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-55 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.startDate
                        ? format(
                            new Date(searchParams.startDate),
                            "PPP",
                          )
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        searchParams.startDate
                          ? new Date(searchParams.startDate)
                          : undefined
                      }
                      defaultMonth={
                        searchParams.startDate
                          ? new Date(searchParams.startDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setSearchParams({
                            startDate: format(date, "yyyy-MM-dd"),
                            page: "1",
                          });
                        } else {
                          const newQuery = { ...router.query };
                          delete newQuery.startDate;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-55 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.endDate
                        ? format(new Date(searchParams.endDate), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        searchParams.endDate
                          ? new Date(searchParams.endDate)
                          : undefined
                      }
                      defaultMonth={
                        searchParams.endDate
                          ? new Date(searchParams.endDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setSearchParams({
                            endDate: format(date, "yyyy-MM-dd"),
                            page: "1",
                          });
                        } else {
                          const newQuery = { ...router.query };
                          delete newQuery.endDate;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Order Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-55 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.orderDate
                        ? format(
                            new Date(searchParams.orderDate),
                            "PPP",
                          )
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        searchParams.orderDate
                          ? new Date(searchParams.orderDate)
                          : undefined
                      }
                      defaultMonth={
                        searchParams.orderDate
                          ? new Date(searchParams.orderDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setSearchParams({
                            orderDate: format(date, "yyyy-MM-dd"),
                            page: "1",
                          });
                        } else {
                          const newQuery = { ...router.query };
                          delete newQuery.orderDate;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Appointment Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-55 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.appointmentDate
                        ? format(
                            new Date(searchParams.appointmentDate),
                            "PPP",
                          )
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        searchParams.appointmentDate
                          ? new Date(searchParams.appointmentDate)
                          : undefined
                      }
                      defaultMonth={
                        searchParams.appointmentDate
                          ? new Date(searchParams.appointmentDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setSearchParams({
                            appointmentDate: format(date, "yyyy-MM-dd"),
                            page: "1",
                          });
                        } else {
                          const newQuery = { ...router.query };
                          delete newQuery.appointmentDate;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <label className="text-sm" htmlFor="sortByDeliveryDate">
                  {" "}
                  Sort By Delivery Date
                </label>
                <Switch
                  id="sortByDeliveryDate"
                  checked={searchParams.sortByDeliveryDate === "1"}
                  onCheckedChange={(val) => {
                    setSearchParams({
                      sortByDeliveryDate: val ? "1" : "0",
                    });
                  }}
                />
              </div>

              <Button
                type="button"
                onClick={exportAllOrders}
                disabled={isExporting}
              >
                Export To CSV{" "}
                {isExporting && <Loader2 className="animate-spin" />}
              </Button>
              <Link href={"/admin/create-order"}>
                <Button type="button">Create New Order</Button>
              </Link>
              <CreatePickupDialog />
              <Button
                type="button"
                onClick={() => {
                  refetchOrders();
                }}
              >
                Refresh {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </div>

            <div className="flex gap-2 w-full flex-col md:flex-row">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                className="flex-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={`Enter ${
                  SEARCH_FIELDS.find((f) => f.value === searchField)?.label ||
                  "value"
                }...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />

              <Button type="button" onClick={handleSearch}>
                Search
              </Button>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>

                {activeFilters.map((filter) => (
                  <span
                    key={filter.field}
                    className="flex items-center bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {filter.label}: {filter.value}
                    <button
                      type="button"
                      className="ml-1 hover:text-red-500 focus:outline-none"
                      onClick={() => removeParam(filter.field)}
                      aria-label={`Remove ${filter.field} filter`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 6L14 14M14 6L6 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">View:</span>
              <Button
                type="button"
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table View
              </Button>
              <Button
                type="button"
                variant={viewMode === "customer" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("customer")}
              >
                Customer View
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            handleTabChange(v as "orders" | "pickups");
          }}
          className="w-full mb-4"
        >
          <TabsList className="border-b border-gray-200 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="orders"
              className="px-4 py-2 text-base font-semibold text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
              onClick={() => {
                const newQuery = { ...router.query };
                delete newQuery.all_orders;
                router.push({ pathname: router.pathname, query: newQuery });
              }}
            >
              Orders
            </TabsTrigger>
            {(user?.role === UserRole.ADMIN ||
              user?.role === UserRole.PICKUP_COORDINATOR) && (
              <TabsTrigger
                value="pickups"
                className="px-4 py-2 text-base font-semibold text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
              >
                Pickups
              </TabsTrigger>
            )}
            {user?.role != UserRole.ADMIN && (
              <Button
                value="all_orders"
                className={cn(
                  "px-4 py-2 text-base font-semibold text-gray-600 bg-transparent  hover:bg-primary",
                  searchParams.all_orders && "bg-primary text-white",
                )}
                onClick={() => {
                  setSearchParams({ all_orders: "1" });
                }}
              >
                All orders
              </Button>
            )}
          </TabsList>

          <TabsContent value="orders">
            {" "}
            {/* Orders List Table */}
            <div className="p-6 border rounded-lg">
              {isPending && !isError ? (
                <p className="text-muted-foreground text-center">Loading...</p>
              ) : (
                <div>
                  {(user.role === UserRole.ADMIN ||
                    user.role === UserRole.CUTTING) && (
                    <>
                      <h3 className="md:text-center text-3xl p-2">
                        Pinned Orders
                      </h3>
                      <Table className="">
                        <TableCaption className="text-left caption-top">
                          Scroll right/left to see all columns
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pin position</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>Customer Phone</TableHead>
                            <TableHead>Order Status</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Custom Price</TableHead>
                            <TableHead>Action</TableHead>
                            {user.role != UserRole.ADMIN && (
                              <TableHead>Order TimeLine</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pinnedOrders?.length === 0 && (
                            <TableRow>
                              <TableCell
                                className="font-medium align-top text-center"
                                colSpan={10}
                              >
                                No pinned orders !!
                              </TableCell>
                            </TableRow>
                          )}
                          {pinnedOrders?.map((order: any) => (
                            <React.Fragment key={`pinned-${order.id}`}>
                              <TableRow
                                className={cn(
                                  "border-b-0",
                                  order.isPinned &&
                                    "bg-teal-100/50 opacity-85 hover:bg-teal-200",
                                )}
                              >
                                <TableCell className="font-medium align-top">
                                  {order.pinPosition}
                                </TableCell>
                                <TableCell className="font-mono text-sm align-top">
                                  <Link
                                    href={`/order/${order.id}`}
                                    target="blank"
                                    className="inline-flex items-center gap-1 underline text-blue-500 hover:text-blue-700"
                                  >
                                    {order.orderId}{" "}
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </TableCell>
                                <TableCell className="font-medium align-top">
                                  {order.customerName}
                                </TableCell>
                                <TableCell className="align-top">
                                  {order.customerPhone}
                                </TableCell>
                                <TableCell className="align-top capitalize">
                                  {order.orderProcessingState.replaceAll(
                                    "_",
                                    " ",
                                  )}
                                  {user.role === UserRole.ADMIN && (
                                    <Select
                                      value={order.orderProcessingState}
                                      onValueChange={(val) =>
                                        updateOrderProcessingState({
                                          orderId: order.id, // use hex id for updating
                                          nextState: val,
                                        })
                                      }
                                    >
                                      <SelectTrigger
                                        className="w-max"
                                        disabled={!canEdit}
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="w-max">
                                        {ORDER_TIMELINE_OPTIONS.map(
                                          (opt, i) => (
                                            <SelectItem
                                              key={i}
                                              value={opt.value}
                                              className="cursor-pointer w-max"
                                            >
                                              {opt.label}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </TableCell>
                                <TableCell className="align-top">
                                  {order.productName}
                                </TableCell>
                                <TableCell className="text-sm align-top">
                                  <div>
                                    <div className="font-medium">
                                      {!isNaN(
                                        new Date(
                                          order.appointmentDate,
                                        ).getTime(),
                                      )
                                        ? format(
                                            new Date(order.appointmentDate),
                                            "MMM dd, yyyy",
                                          )
                                        : "N/A"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {order.appointmentTime}
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell className="text-sm align-top">
                                  {order.orderDate ? (
                                    <div>
                                      <div className="font-medium">
                                        {format(
                                          new Date(order.orderDate),
                                          "MMM dd, yyyy",
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {format(
                                          new Date(order.orderDate),
                                          "hh:mm a",
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>

                                <TableCell className="align-top">
                                  Rs.{" "}
                                  {order.customPrice
                                    ? order.customPrice
                                    : order.productPrice}
                                </TableCell>

                                <TableCell className="flex gap-2 align-top">
                                  {user.role === UserRole.ADMIN && (
                                    <Button
                                      title="delete order"
                                      variant="outline"
                                      color="error"
                                      onClick={() => openConfirm(order.id)} // Pass order id here
                                    >
                                      <Trash />
                                    </Button>
                                  )}
                                  <Button
                                    title="add/edit measurements"
                                    variant="outline"
                                    color="error"
                                    onClick={() => {
                                      setOrderExistingMeasurementData(
                                        order.measurements,
                                      );
                                      orderToEditMeasurement.current = order.id;
                                      setIsMeasurementModalOpen(true);
                                    }}
                                  >
                                    <RulerIcon />
                                  </Button>
                                  {user.role === UserRole.ADMIN && (
                                    <Button
                                      title="Repeat/copy order"
                                      variant="outline"
                                      color="error"
                                      onClick={() => {
                                        duplicateOrderMutation(order.id);
                                      }}
                                      disabled={isCopyingOrder}
                                    >
                                      {isCopyingOrder ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Repeat />
                                      )}
                                    </Button>
                                  )}

                                  {user.role === UserRole.ADMIN && (
                                    <div>
                                      <label
                                        className="text-sm"
                                        htmlFor="pinOrder"
                                      >
                                        Pin order
                                      </label>
                                      <Switch
                                        disabled={isUpdatingPin}
                                        id="pinOrder"
                                        checked={order.isPinned}
                                        onCheckedChange={(val) => {
                                          const pinPosition =
                                            window.prompt("Enter pin position");
                                          pinOrder({
                                            orderId: order.id,
                                            pinPosition: Number(pinPosition),
                                            isPinned: val,
                                          });
                                        }}
                                      />
                                      {isUpdatingPin && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      )}
                                    </div>
                                  )}
                                </TableCell>

                                {user.role != UserRole.ADMIN && (
                                  <TableCell>
                                    <EventsOptions orderId={order.id} />
                                  </TableCell>
                                )}
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  colSpan={user.role != UserRole.ADMIN ? 10 : 9}
                                  className="p-0"
                                >
                                  <OrderTimelineView
                                    timeline={order?.timeLine || []}
                                  />
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}

                  <h3 className="text-xl font-semibold p-2">Orders List</h3>

                  {viewMode === "customer" ? (
                    // Customer Grouped List View
                    <div className="rounded-lg border overflow-hidden">
                      {/* header row */}
                      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted/60 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <div className="col-span-3">Customer</div>
                        <div className="col-span-1 text-center">Orders</div>
                        <div className="col-span-2">Next Delivery</div>
                        <div className="col-span-2">Payment</div>
                        <div className="col-span-2">Progress</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>

                      <div className="divide-y">
                        {groupedOrders.length === 0 ? (
                          <p className="text-center text-muted-foreground py-10">
                            No orders found
                          </p>
                        ) : (
                          groupedOrders.map((customer: any) => {
                            const isOpen = expandedCustomers.includes(
                              customer.customerId,
                            );
                            return (
                              <div key={customer.customerId}>
                                <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-muted/40 transition-colors">
                                  <div className="col-span-12 md:col-span-3 flex items-center gap-3 min-w-0">
                                    <button
                                      type="button"
                                      aria-label={isOpen ? "Collapse" : "Expand"}
                                      onClick={() =>
                                        toggleCustomerExpanded(customer.customerId)
                                      }
                                      className="h-7 w-7 shrink-0 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted"
                                    >
                                      <span
                                        className={cn(
                                          "transition-transform text-xs",
                                          isOpen && "rotate-90",
                                        )}
                                      >
                                        ▶
                                      </span>
                                    </button>
                                    <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                                      {(customer.customerName || "?")
                                        .trim()
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold truncate">
                                        {customer.customerName || "Unknown"}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {customer.customerPhone || "—"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-span-3 md:col-span-1 md:text-center">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                      {customer.totalItems}
                                    </span>
                                  </div>

                                  <div className="col-span-4 md:col-span-2 text-sm">
                                    {customer.nextDelivery &&
                                    !isNaN(new Date(customer.nextDelivery).getTime())
                                      ? format(
                                          new Date(customer.nextDelivery),
                                          "dd MMM yyyy",
                                        )
                                      : "N/A"}
                                  </div>

                                  <div className="col-span-5 md:col-span-2 text-sm">
                                    <span className="text-green-700">
                                      {customer.paidCount} paid
                                    </span>
                                    {customer.pendingPaymentCount > 0 && (
                                      <span className="text-amber-700">
                                        {" "}
                                        · {customer.pendingPaymentCount} pending
                                      </span>
                                    )}
                                  </div>

                                  <div className="col-span-8 md:col-span-2">
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-primary"
                                        style={{
                                          width: `${
                                            customer.totalItems
                                              ? (customer.completedCount /
                                                  customer.totalItems) *
                                                100
                                              : 0
                                          }%`,
                                        }}
                                      />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-1">
                                      {customer.completedCount}/{customer.totalItems}{" "}
                                      completed
                                    </div>
                                  </div>

                                  <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-3">
                                    <span className="font-semibold">
                                      ₹{customer.totalAmount.toLocaleString()}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedCustomer(customer);
                                        setIsCustomerModalOpen(true);
                                      }}
                                    >
                                      View
                                    </Button>
                                  </div>
                                </div>

                                {isOpen && (
                                  <div className="bg-muted/20 px-4 pb-3">
                                    <div className="rounded-md border bg-background divide-y">
                                      {customer.orders.map((order: any) => (
                                        <div
                                          key={order.id}
                                          role="button"
                                          tabIndex={0}
                                          onClick={() => openOrderModal(order.id)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              openOrderModal(order.id);
                                          }}
                                          className="grid grid-cols-12 gap-3 items-center px-3 py-2.5 text-sm hover:bg-muted/50 cursor-pointer"
                                        >
                                          <div className="col-span-12 md:col-span-4 min-w-0">
                                            <div className="font-mono text-[11px] text-blue-600 truncate">
                                              {order.orderId}
                                            </div>
                                            <div className="font-medium truncate">
                                              {order.productName}
                                            </div>
                                          </div>
                                          <div className="col-span-6 md:col-span-3 text-xs">
                                            <span className="text-muted-foreground">
                                              Delivery:{" "}
                                            </span>
                                            {order.appointmentDate &&
                                            !isNaN(
                                              new Date(order.appointmentDate).getTime(),
                                            )
                                              ? format(
                                                  new Date(order.appointmentDate),
                                                  "dd MMM yyyy",
                                                )
                                              : "N/A"}
                                          </div>
                                          <div className="col-span-6 md:col-span-2">
                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                              {order.orderProcessingState?.replace(
                                                /_/g,
                                                " ",
                                              )}
                                            </span>
                                          </div>
                                          <div className="col-span-6 md:col-span-2">
                                            <span
                                              className={cn(
                                                "text-[11px] px-2 py-0.5 rounded-full border",
                                                getPaymentStatusBadgeColor(
                                                  order.paymentStatus,
                                                ).bg,
                                                getPaymentStatusBadgeColor(
                                                  order.paymentStatus,
                                                ).text,
                                                getPaymentStatusBadgeColor(
                                                  order.paymentStatus,
                                                ).border,
                                              )}
                                            >
                                              {getPaymentStatusDisplayText(
                                                order.paymentStatus,
                                              )}
                                            </span>
                                          </div>
                                          <div className="col-span-6 md:col-span-1 md:text-right font-semibold">
                                            ₹
                                            {(
                                              order.customPrice ||
                                              order.productPrice ||
                                              0
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  ) : (
                    // Table View
                    <>
                    {/* Bulk status update UI */}
                    <div className="flex items-center gap-4 mb-2">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span>Select All</span>
                    <Select
                      value={bulkStatus}
                      onValueChange={setBulkStatus}
                      disabled={selectedOrderIds.length === 0 || isBulkUpdating}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Bulk Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_TIMELINE_OPTIONS.map((opt, i) => (
                          <SelectItem
                            key={i}
                            value={opt.value}
                            className="cursor-pointer w-max"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleBulkStatusUpdate}
                      disabled={
                        isBulkUpdating ||
                        !bulkStatus ||
                        selectedOrderIds.length === 0
                      }
                    >
                      {isBulkUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Update Selected"
                      )}
                    </Button>
                    {selectedOrderIds.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {selectedOrderIds.length} selected
                      </span>
                    )}
                  </div>
                  <Table className="">
                    <TableCaption className="text-left caption-top">
                      Scroll right/left to see all columns
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Customer Phone</TableHead>
                        <TableHead>Order Status</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Custom Price</TableHead>
                        <TableHead>Action</TableHead>
                        {user.role != UserRole.ADMIN && (
                          <TableHead>Order TimeLine</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <React.Fragment key={order.id}>
                          <TableRow className={cn("border-b-0")}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedOrderIds.includes(order.id)}
                                onChange={(e) =>
                                  handleSelectRow(order.id, e.target.checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm align-top">
                              <Link
                                href={`/order/${order.id}`}
                                target="blank"
                                className="inline-flex items-center gap-1 underline text-blue-500 hover:text-blue-700"
                              >
                                {order.orderId}{" "}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </TableCell>
                            <TableCell className="font-medium align-top">
                              {order.customerName}
                            </TableCell>
                            <TableCell className="align-top">
                              {order.customerPhone}
                            </TableCell>
                            <TableCell className="align-top capitalize">
                              {order.orderProcessingState.replaceAll("_", " ")}
                              {user.role === UserRole.ADMIN && (
                                <Select
                                  value={order.orderProcessingState}
                                  onValueChange={(val) =>
                                    updateOrderProcessingState({
                                      orderId: order.id, // use hex id for updating
                                      nextState: val,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    className="w-max"
                                    disabled={!canEdit}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="w-max">
                                    {ORDER_TIMELINE_OPTIONS.map((opt, i) => (
                                      <SelectItem
                                        key={i}
                                        value={opt.value}
                                        className="cursor-pointer w-max"
                                      >
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell className="align-top">
                              {order.productName}
                            </TableCell>
                            <TableCell className="text-sm align-top">
                              <div>
                                <div className="font-medium">
                                  {!isNaN(
                                    new Date(order.appointmentDate).getTime(),
                                  )
                                    ? format(
                                        new Date(order.appointmentDate),
                                        "MMM dd, yyyy",
                                      )
                                    : "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.appointmentTime}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm align-top">
                              {order.orderDate ? (
                                <div>
                                  <div className="font-medium">
                                    {format(
                                      new Date(order.orderDate),
                                      "MMM dd, yyyy",
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(order.orderDate),
                                      "hh:mm a",
                                    )}
                                  </div>
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>

                            <TableCell className="align-top">
                              Rs.{" "}
                              {order.customPrice
                                ? order.customPrice
                                : order.productPrice}
                            </TableCell>

                            <TableCell className="flex gap-2 align-top">
                              {user.role === UserRole.ADMIN && (
                                <Button
                                  title="delete order"
                                  variant="outline"
                                  color="error"
                                  onClick={() => openConfirm(order.id)} // Pass order id here
                                >
                                  <Trash />
                                </Button>
                              )}
                              <Button
                                title="add/edit measurements"
                                variant="outline"
                                color="error"
                                onClick={() => {
                                  setOrderExistingMeasurementData(
                                    order.measurements,
                                  );
                                  orderToEditMeasurement.current = order.id;
                                  setIsMeasurementModalOpen(true);
                                }}
                              >
                                <RulerIcon />
                              </Button>
                              {user.role === UserRole.ADMIN && (
                                <Button
                                  title="Repeat/copy order"
                                  variant="outline"
                                  color="error"
                                  onClick={() => {
                                    duplicateOrderMutation(order.id);
                                  }}
                                  disabled={isCopyingOrder}
                                >
                                  {isCopyingOrder ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Repeat />
                                  )}
                                </Button>
                              )}

                              {user.role === UserRole.ADMIN && (
                                <div>
                                  <label className="text-sm" htmlFor="pinOrder">
                                    Pin order
                                  </label>
                                  <Switch
                                    disabled={isUpdatingPin}
                                    id="pinOrder"
                                    checked={order.isPinned}
                                    onCheckedChange={(val) => {
                                      const pinPosition =
                                        window.prompt("Enter pin position");
                                      pinOrder({
                                        orderId: order.id,
                                        pinPosition: Number(pinPosition),
                                        isPinned: val,
                                      });
                                    }}
                                  />
                                  {isUpdatingPin && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  )}
                                </div>
                              )}

                              {user.role === UserRole.CUTTING && (
                                <div className="flex flex-col gap-2">
                                  <Select
                                    disabled={isAssigningToStitchingAgent}
                                    value={order.assignedToStitchingAgentId}
                                    onValueChange={(val) => {
                                      assignOrderToStitchingAgent({
                                        orderId: order.id,
                                        agentId: val,
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="w-max">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="w-max">
                                      <SelectItem value="none">None</SelectItem>
                                      {teamMembersViaRole?.map((el) => {
                                        return (
                                          <SelectItem
                                            key={el._id}
                                            value={el._id}
                                          >
                                            {el.firstName} {el.lastName}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  {isAssigningToStitchingAgent && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  )}
                                </div>
                              )}
                            </TableCell>

                            {user.role != UserRole.ADMIN && (
                              <TableCell>
                                <EventsOptions orderId={order.id} />
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell
                              colSpan={user.role != UserRole.ADMIN ? 11 : 10}
                              className="p-0"
                            >
                              <OrderTimelineView
                                timeline={order?.timeLine || []}
                              />
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                  </>
                  )}
            {(
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {pagination?.count || 0} of {pagination?.total || 0}{" "}
                  orders
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      pagination?.prevPage &&
                      handlePagination(pagination.prevPage)
                    }
                    disabled={!pagination?.hasPrevPage || !isExporting}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {pagination?.currentPage || 1} of{" "}
                    {pagination?.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      pagination?.nextPage &&
                      handlePagination(pagination.nextPage)
                    }
                    disabled={!pagination?.hasNextPage || isExporting}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
                </div>
              )}
            </div>
          </TabsContent>

          {(user.role === UserRole.ADMIN ||
            user.role === UserRole.PICKUP_COORDINATOR) && (
            <TabsContent value="pickups">
              <PickupsPage />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <MeasurementsModal
        isOpen={isMeasurementModalOpen}
        onOpenChange={setIsMeasurementModalOpen}
        onSubmit={(data) => {
          console.log(data);
          updateMeasurements({
            details: {
              optionsData: {
                category: data.optionsData?.category,
                ...data.optionsData?.details,
              },
              bodyMeasurement: {
                category: data.bodyMeasurement?.category,
                ...data.bodyMeasurement?.details,
              },
            },
          });
        }}
        isUpdaing={updatingMeasurements}
        initialData={orderExistingMeasurementData}
        key={orderToEditMeasurement.current}
      />

      {/* Customer Orders Detail Modal */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
          <DialogContent className="fixed top-1/2 left-1/2 z-50 w-full max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Header */}
                <div className="border-b pb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
                      {(selectedCustomer.customerName || "?")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl font-bold truncate">
                        {selectedCustomer.customerName}
                      </h2>
                      <p className="text-muted-foreground text-sm truncate">
                        {selectedCustomer.customerPhone || "—"}
                        {selectedCustomer.customerEmail
                          ? ` · ${selectedCustomer.customerEmail}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {[
                      {
                        label: "Total Orders",
                        value: selectedCustomer.totalItems,
                      },
                      {
                        label: "Total Value",
                        value: `₹${selectedCustomer.totalAmount.toLocaleString()}`,
                      },
                      {
                        label: "Payment Pending",
                        value: selectedCustomer.pendingPaymentCount ?? 0,
                      },
                      {
                        label: "Next Delivery",
                        value: selectedCustomer.nextDelivery
                          ? format(
                              new Date(selectedCustomer.nextDelivery),
                              "dd MMM yyyy",
                            )
                          : "N/A",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border bg-muted/40 p-3"
                      >
                        <div className="text-xs text-muted-foreground">
                          {stat.label}
                        </div>
                        <div className="text-base font-semibold">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Orders ({selectedCustomer.orders.length})
                  </h3>
                  <div className="rounded-lg border divide-y overflow-hidden">
                    {selectedCustomer.orders.map((order: any) => (
                      <div
                        key={order.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openOrderModal(order.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") openOrderModal(order.id);
                        }}
                        className="grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-muted/50 cursor-pointer text-sm"
                      >
                        <div className="col-span-12 md:col-span-3 min-w-0">
                          <div className="font-mono text-xs text-blue-600 truncate">
                            {order.orderId}
                          </div>
                          <div className="font-medium truncate">
                            {order.productName}
                          </div>
                        </div>
                        <div className="col-span-6 md:col-span-3 min-w-0">
                          <div className="text-[11px] text-muted-foreground">
                            Delivery
                          </div>
                          <div className="truncate">
                            {order.appointmentDate &&
                            !isNaN(new Date(order.appointmentDate).getTime())
                              ? format(
                                  new Date(order.appointmentDate),
                                  "dd MMM yyyy",
                                )
                              : "N/A"}
                            {order.appointmentTime
                              ? ` · ${order.appointmentTime}`
                              : ""}
                          </div>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                            {order.orderProcessingState?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full border",
                              getPaymentStatusBadgeColor(order.paymentStatus).bg,
                              getPaymentStatusBadgeColor(order.paymentStatus).text,
                              getPaymentStatusBadgeColor(order.paymentStatus)
                                .border,
                            )}
                          >
                            {getPaymentStatusDisplayText(order.paymentStatus)}
                          </span>
                        </div>
                        <div className="col-span-12 md:col-span-2 md:text-right font-semibold">
                          ₹
                          {(
                            order.customPrice ||
                            order.productPrice ||
                            0
                          ).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


                {/* Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground">Total Amount</div>
                    <div className="text-2xl font-bold">
                      ₹{selectedCustomer.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end">
                  <Button onClick={() => setIsCustomerModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Single Order Detail Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/60 z-[60]" />
          <DialogContent className="fixed top-1/2 left-1/2 z-[61] w-full max-w-5xl max-h-[92vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {selectedOrder ? (
              <>
                <div className="flex items-start justify-between gap-4 border-b px-6 py-4 bg-muted/30">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold font-mono">
                        {selectedOrder.orderId}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {selectedOrder.orderProcessingState?.replace(/_/g, " ")}
                      </span>
                      <Link
                        href={`/order/${selectedOrder.id}`}
                        target="blank"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        Open full page <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedOrder.customerName} ·{" "}
                      {selectedOrder.customerPhone || "—"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOrderModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>

                <div className="overflow-y-auto px-6 py-5 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Product", value: selectedOrder.productName || "—" },
                      {
                        label: "Amount",
                        value: `₹${(
                          selectedOrder.customPrice || selectedOrder.productPrice || 0
                        ).toLocaleString()}`,
                      },
                      {
                        label: "Order Date",
                        value: selectedOrder.orderDate
                          ? format(new Date(selectedOrder.orderDate), "dd MMM yyyy, hh:mm a")
                          : "N/A",
                      },
                      {
                        label: "Delivery",
                        value:
                          selectedOrder.appointmentDate &&
                          !isNaN(new Date(selectedOrder.appointmentDate).getTime())
                            ? `${format(new Date(selectedOrder.appointmentDate), "dd MMM yyyy")}${selectedOrder.appointmentTime ? ` · ${selectedOrder.appointmentTime}` : ""}`
                            : "N/A",
                      },
                      {
                        label: "Payment Status",
                        value: getPaymentStatusDisplayText(selectedOrder.paymentStatus),
                      },
                      {
                        label: "Order Status",
                        value: selectedOrder.orderStatus || "N/A",
                      },
                      {
                        label: "Coupon",
                        value: selectedOrder.couponCode || "—",
                      },
                      {
                        label: "Pinned",
                        value: selectedOrder.isPinned
                          ? `Yes (#${selectedOrder.pinPosition ?? "-"})`
                          : "No",
                      },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border bg-muted/30 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {s.label}
                        </div>
                        <div className="text-sm font-semibold capitalize break-words">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assignment & status controls */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="text-sm font-semibold">Manage Order</h3>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                          Processing State
                        </label>
                        <Select
                          value={selectedOrder.orderProcessingState}
                          onValueChange={(val) =>
                            updateOrderProcessingState({
                              orderId: selectedOrder.id,
                              nextState: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-56" disabled={!canEdit}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_TIMELINE_OPTIONS.map((opt, i) => (
                              <SelectItem key={i} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                          Assign Stitching Agent
                        </label>
                        <Select
                          disabled={isAssigningToStitchingAgent || !canEdit}
                          value={selectedOrder.assignedToStitchingAgentId || "none"}
                          onValueChange={(val) =>
                            assignOrderToStitchingAgent({
                              orderId: selectedOrder.id,
                              agentId: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {teamMembersViaRole?.map((el: any) => (
                              <SelectItem key={el._id} value={el._id}>
                                {el.firstName} {el.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {user?.role === UserRole.ADMIN && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">
                            Pin order
                          </label>
                          <div className="flex items-center gap-2 h-10">
                            <Switch
                              disabled={isUpdatingPin}
                              checked={!!selectedOrder.isPinned}
                              onCheckedChange={(val) => {
                                const pinPosition = window.prompt("Enter pin position");
                                pinOrder({
                                  orderId: selectedOrder.id,
                                  pinPosition: Number(pinPosition),
                                  isPinned: val,
                                });
                              }}
                            />
                            {isUpdatingPin && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOrderExistingMeasurementData(selectedOrder.measurements);
                          orderToEditMeasurement.current = selectedOrder.id;
                          setIsMeasurementModalOpen(true);
                        }}
                      >
                        <RulerIcon className="w-4 h-4 mr-1" /> Measurements
                      </Button>
                      {user?.role === UserRole.ADMIN && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCopyingOrder}
                          onClick={() => duplicateOrderMutation(selectedOrder.id)}
                        >
                          {isCopyingOrder ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Repeat className="w-4 h-4 mr-1" />
                          )}
                          Repeat Order
                        </Button>
                      )}
                      {user?.role === UserRole.ADMIN && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setIsOrderModalOpen(false);
                            openConfirm(selectedOrder.id);
                          }}
                        >
                          <Trash className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      )}
                    </div>

                    {user?.role !== UserRole.ADMIN && (
                      <div className="pt-2 border-t">
                        <EventsOptions orderId={selectedOrder.id} />
                      </div>
                    )}
                  </div>

                  {/* Measurements */}
                  {selectedOrder.measurements && (
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3">Measurements</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(
                          selectedOrder.measurements?.bodyMeasurement || {},
                        ).map(([k, v]) => (
                          <div key={k} className="rounded border bg-muted/20 px-2 py-1">
                            <span className="text-xs text-muted-foreground capitalize">
                              {k.replace(/_/g, " ")}:{" "}
                            </span>
                            <span className="font-medium">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {selectedOrder.timeLine?.length > 0 && (
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3">Timeline</h3>
                      <OrderTimelineView timeline={selectedOrder.timeLine} />
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </AdminLayout>
  );
};

// const OrderRankUpdate = ({
//   order,
//   onUpdate,
//   isPending,
// }: {
//   order: any;
//   onUpdate: (rank: number) => void;
//   isPending: boolean;
// }) => {
//   const [rank, setRank] = useState<string>(order.rank?.toString() || "");

//   useEffect(() => {
//     setRank(order.rank?.toString() || "");
//   }, [order.rank]);

//   return (
//     <div className="flex gap-2">
//       <Input
//         type="number"
//         placeholder="rank"
//         className="w-20 h-9"
//         value={rank}
//         onChange={(e) => setRank(e.target.value)}
//       />
//       <Button
//         size="sm"
//         onClick={() => {
//           if (rank !== "") {
//             onUpdate(parseInt(rank));
//           }
//         }}
//         disabled={isPending}
//       >
//         {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
//       </Button>
//     </div>
//   );
// };

export default OrdersPage;
