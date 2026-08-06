import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrdersByUserIdApi } from "@/services/modules/orders.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Package,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  CalendarX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStatusColor } from "./OrderDetailsPage";
import { OrderStatus } from "@/types/enums";
import { useRouter } from "@/lib/next-router-compat";

interface Order {
  orderId: string;
  orderDate: string;
  orderStatus: string;
  style: {
    name: string;
    price: number;
  };
  appointment?: {
    _id: string;
    date: string;
    time: string;
    status: string;
    notes?: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    total: number;
    count: number;
    limit: number;
    nextPage: number | null;
    prevPage: number | null;
  };
  filters: {
    limit: number;
    page: number;
  };
}

const ProfileOrdersTab: React.FC = () => {
  const navigate = useRouter();
  const { toast } = useToast();
 const router = useRouter();
  const searchParams = router.query;
  const setSearchParams = (params) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...params,
      },
    });
  };  const page = parseInt(router.query.page || "1", 10);
  const limit = parseInt(router.query.limit || "10", 10);

  const { data, isLoading, isError } = useQuery<OrdersResponse>({
    queryKey: ["orders", page, limit],
    queryFn: async () => {
      try {
        const response = await getOrdersByUserIdApi(page, limit);
        return response;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">Failed to load orders</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data?.orders?.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg ">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {data.orders.map((order) => (
          <Card
            key={order.orderId}
            className="p-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-base">{order.style.name}</h3>
                <p className="text-sm text-gray-500">
                  ₹{order.style.price.toLocaleString()}
                </p>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.orderStatus as OrderStatus,
                )}`}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(order.orderDate), "MMM dd, yyyy")}</span>
              </div>
              {order.appointment &&
              order.appointment.date &&
              order.appointment.time ? (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(order.appointment.date), "MMM dd, yyyy")}{" "}
                      at {order.appointment.time}
                    </span>
                  </div>
                  {order.appointment.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      Note: {order.appointment.notes}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <CalendarX className="w-4 h-4" />
                  <span className="text-gray-500">Appointment Not Booked</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/order/${order.orderId}`)}
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(data.pagination.prevPage!)}
            disabled={isLoading || !data.pagination.hasPrevPage}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(data.pagination.nextPage!)}
            disabled={isLoading || !data.pagination.hasNextPage}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileOrdersTab;
