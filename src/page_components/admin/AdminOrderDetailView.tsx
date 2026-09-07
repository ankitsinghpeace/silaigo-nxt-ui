"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  RulerIcon,
  Repeat,
  Trash,
  MessageSquareText,
  MapPin,
  CheckCircle,
  XCircle,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import {
  getOrderByIdApi,
  notifyOrderApi,
} from "@/services/modules/orders.api";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/auth.api";
import { OrderProcessingState, OrderStatus, PaymentStatus } from "@/types/enums";
import MeasurementsTable from "@/components/MeasurementsTable";
import ImagePreview from "@/components/admin/ImagePreview";
import OrderTimelineView from "@/components/OrderTImeLineView";
import UpdateOrderCustomizations from "@/page_components/admin/UpdateOrderCustomizations";
import UpdateOrderOptions from "@/page_components/admin/UpdateOrderOptions";
import { cn } from "@/lib/utils";
import { PROCESSING_STAGE_SEQUENCE, STAGE_LABELS } from "@/lib/orderStageConfig";
import { getAssignedCuttingAgent, setAssignedCuttingAgent } from "@/lib/cuttingAgentStore";

const ORDER_STATUS_EDIT_OPTIONS = [OrderStatus.COMPLETED, OrderStatus.CANCELLED];

const NOTIFY_STAGES: {
  value: "picked_up" | "ready" | "dispatched" | "delivered";
  label: string;
}[] = [
    { value: "picked_up", label: "Picked Up" },
    { value: "ready", label: "Almost Ready" },
    { value: "dispatched", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
  ];

const getPaymentBadge = (status?: string) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle, label: "Success" };
    case PaymentStatus.FAILED:
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "Failed" };
    case PaymentStatus.REFUNDED:
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: DollarSign, label: "Refunded" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: DollarSign, label: status || "Pending" };
  }
};

interface AdminOrderDetailViewProps {
  order: any;
  canEdit: boolean;
  isReadOnlyProcessingState?: boolean;
  teamMembersViaRole: any[];
  cuttingAgents?: any[];
  isAssigningToStitchingAgent: boolean;
  isUpdatingPin: boolean;
  isDuplicating: boolean;
  showAdminActions: boolean;
  onAssignStitchingAgent: (orderId: string, agentId: string) => void;
  onAssignCuttingAgent?: (orderId: string, agentId: string, agentName?: string) => void;
  onUpdateProcessingState: (orderId: string, nextState: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onPinOrder: (orderId: string, isPinned: boolean, pinPosition: number | null) => void;
  onDuplicate: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onEditMeasurements: (orderId: string, measurements: any) => void;
}

const AdminOrderDetailView: React.FC<AdminOrderDetailViewProps> = ({
  order,
  canEdit,
  isReadOnlyProcessingState,
  teamMembersViaRole,
  cuttingAgents = [],
  isAssigningToStitchingAgent,
  isUpdatingPin,
  isDuplicating,
  showAdminActions,
  onAssignStitchingAgent,
  onAssignCuttingAgent,
  onUpdateProcessingState,
  onUpdateOrderStatus,
  onPinOrder,
  onDuplicate,
  onDelete,
  onEditMeasurements,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showTimeline, setShowTimeline] = useState(false);
  const [isCustomizationsOpen, setIsCustomizationsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [assignedCuttingAgentState, setAssignedCuttingAgentState] = useState(() =>
    getAssignedCuttingAgent(order.id || order._id)
  );

  const isAdmin = user?.role === UserRole.ADMIN;
  const isPickupCoordinator = user?.role === UserRole.PICKUP_COORDINATOR;
  const isCuttingAgent = user?.role === UserRole.CUTTING;
  const isStitchingAgent = user?.role === UserRole.STITCHING;

  const filteredCuttingAgents = React.useMemo(() => {
    return Array.isArray(cuttingAgents) ? cuttingAgents : [];
  }, [cuttingAgents]);

  const activeCuttingAgentValue = React.useMemo(() => {
    if (!assignedCuttingAgentState?.agentId) return "none";
    const exists = filteredCuttingAgents.some(
      (a: any) => (a._id || a.userId || a.id) === assignedCuttingAgentState.agentId
    );
    return exists ? assignedCuttingAgentState.agentId : "none";
  }, [assignedCuttingAgentState, filteredCuttingAgents]);

  const handleCuttingAgentChange = (agentId: string) => {
    const activeList = Array.isArray(cuttingAgents) ? cuttingAgents : [];
    const selectedAgent = activeList.find(
      (a: any) => (a._id || a.userId || a.id) === agentId
    );
    const agentName = selectedAgent
      ? `${selectedAgent.firstName || selectedAgent.name || ""} ${selectedAgent.lastName || ""}`.trim()
      : undefined;
    setAssignedCuttingAgent(order.id || order._id, agentId === "none" ? "" : agentId, agentName);
    setAssignedCuttingAgentState(getAssignedCuttingAgent(order.id || order._id));
    if (onAssignCuttingAgent) {
      onAssignCuttingAgent(order.id || order._id, agentId === "none" ? "" : agentId, agentName);
    }
    toast({ title: "Cutting agent assigned successfully" });
  };

  const [currentProcessingState, setCurrentProcessingState] = useState(
    order.orderProcessingState || OrderProcessingState.ORDER_PLACED
  );

  React.useEffect(() => {
    if (order.orderProcessingState) {
      setCurrentProcessingState(order.orderProcessingState);
    }
  }, [order.orderProcessingState]);

  const handleProcessingStateChange = (nextState: string) => {
    setCurrentProcessingState(nextState);
    onUpdateProcessingState(order.id || order._id, nextState);
    if (nextState === OrderProcessingState.ORDER_FULFILLED && filteredCuttingAgents.length === 1) {
      const singleAgent = filteredCuttingAgents[0];
      const singleAgentId = singleAgent._id || singleAgent.userId || singleAgent.id;
      const singleAgentName =
        `${singleAgent.firstName || singleAgent.name || ""} ${singleAgent.lastName || ""}`.trim() || singleAgent.email;
      setAssignedCuttingAgent(order.id || order._id, singleAgentId, singleAgentName);
      setAssignedCuttingAgentState(getAssignedCuttingAgent(order.id || order._id));
      if (onAssignCuttingAgent) {
        onAssignCuttingAgent(order.id || order._id, singleAgentId, singleAgentName);
      }
    }
  };

  const filteredStitchingAgents = React.useMemo(() => {
    if (!Array.isArray(teamMembersViaRole)) return [];
    return teamMembersViaRole.filter((agent: any) => {
      const r = typeof agent.role === "string" ? agent.role : agent.role?.code || agent.role?.name;
      if (!r) return true;
      return String(r).toUpperCase() === "STITCHING";
    });
  }, [teamMembersViaRole]);

  const [assignedStitchingAgentId, setAssignedStitchingAgentId] = useState<string>(() => {
    return (
      order.assignedToStitchingAgentId ||
      order.assignedStitchingAgentId ||
      order.assignedStitchingAgent?._id ||
      order.assignedStitchingAgent?.userId ||
      order.assignedStitchingAgent?.id ||
      "none"
    );
  });

  React.useEffect(() => {
    const currentId =
      order.assignedToStitchingAgentId ||
      order.assignedStitchingAgentId ||
      order.assignedStitchingAgent?._id ||
      order.assignedStitchingAgent?.userId ||
      order.assignedStitchingAgent?.id ||
      "none";
    setAssignedStitchingAgentId(currentId);
  }, [
    order.assignedToStitchingAgentId,
    order.assignedStitchingAgentId,
    order.assignedStitchingAgent,
  ]);

  const activeStitchingAgentValue = React.useMemo(() => {
    if (!assignedStitchingAgentId || assignedStitchingAgentId === "none") return "none";
    const exists = filteredStitchingAgents.some(
      (a: any) => (a._id || a.userId || a.id) === assignedStitchingAgentId
    );
    return exists ? assignedStitchingAgentId : "none";
  }, [assignedStitchingAgentId, filteredStitchingAgents]);

  const handleStitchingAgentChange = (val: string) => {
    setAssignedStitchingAgentId(val);
    onAssignStitchingAgent(order.id || order._id, val === "none" ? "" : val);
  };

  const { data: detail, isLoading } = useQuery({
    queryKey: ["order-detail", order.id],
    queryFn: () => getOrderByIdApi(order.id),
    staleTime: 1000 * 60 * 2,
    retry: 0,
  });

  const { mutate: notifyCustomer, isPending: isNotifying, variables: notifyVars } =
    useMutation({
      mutationFn: (stage: "picked_up" | "ready" | "dispatched" | "delivered") =>
        notifyOrderApi(order.id, stage),
      onSuccess: () => {
        toast({ title: "Customer notified", description: "SMS update sent successfully." });
      },
      onError: (error) => {
        toast({
          title: "Couldn't send notification",
          description: `${generateErrorMessage(error)} (this action needs the backend "/orders/:id/notify" endpoint — see BACKEND_CHANGES_NEEDED.md)`,
          variant: "destructive",
        });
      },
    });

  const refreshDetail = () =>
    queryClient.invalidateQueries({ queryKey: ["order-detail", order.id] });

  const productName = detail?.style?.name || order.productName || "—";
  const customerPhone = order.customerPhone || detail?.address?.phone || "—";
  const totalAmount =
    order.customPrice || order.productPrice || detail?.priceBreakup?.total || 0;
  const paymentStatus = order.paymentStatus || detail?.payment?.status;
  const notes = order.notes || detail?.order?.notes;
  const measurements = order.measurements || detail?.measurements;
  const customizations = detail?.priceBreakup?.customizations || [];
  const paymentBadge = getPaymentBadge(paymentStatus);
  const PaymentIcon = paymentBadge.icon;
  const allImageUrls: string[] = Array.isArray(order.imageUrls)
    ? order.imageUrls
    : Array.isArray(detail?.order?.imageUrls)
      ? detail.order.imageUrls
      : Array.isArray(detail?.imageUrls)
        ? detail.imageUrls
        : [];

  const fabricImageUrl =
    allImageUrls.find(
      (url: string) => typeof url === "string" && url.toLowerCase().includes("fabric"),
    ) ||
    allImageUrls[0] ||
    detail?.style?.image ||
    order.productImage;

  return (
    <div className="space-y-5" data-testid="admin-order-detail-view">
      {/* Quick facts */}
      <div className={cn("grid gap-3", isCuttingAgent || isStitchingAgent ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4")}>
        {[
          { label: "Product", value: productName },
          ...(!isCuttingAgent && !isStitchingAgent
            ? [{ label: "Total Amount", value: `₹${Number(totalAmount).toLocaleString()}` }]
            : []),
          {
            label: "Delivery",
            value:
              order.appointmentDate && !isNaN(new Date(order.appointmentDate).getTime())
                ? `${format(new Date(order.appointmentDate), "dd MMM yyyy")}${order.appointmentTime ? ` · ${order.appointmentTime}` : ""}`
                : "N/A",
          },
          {
            label: "Order Date",
            value: order.orderDate ? format(new Date(order.orderDate), "dd MMM yyyy, hh:mm a") : "N/A",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-muted/30 p-3" data-testid={`order-stat-${s.label.replace(/\s+/g, "-").toLowerCase()}`}>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="text-sm font-semibold break-words">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column: style, customizations, address, measurements */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold mb-3">Style & Customisations</h3>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                {fabricImageUrl && (
                  <ImagePreview
                    src={fabricImageUrl}
                    alt={productName}
                    className="h-44 w-44 shrink-0 rounded-lg object-cover"
                    showRemoveButton={false}
                  />
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="font-medium">{productName}</p>
                  {customizations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customizations.map((c: any, i: number) => (
                        <span
                          key={`${c.id}-${i}`}
                          className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-1 text-xs"
                        >
                          {c.title}
                          {c.price > 0 && !isCuttingAgent && !isStitchingAgent && <span className="text-muted-foreground">₹{c.price}</span>}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No customisations recorded.</p>
                  )}
                </div>
              </div>
            )}
            {showAdminActions && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => setIsCustomizationsOpen(true)} data-testid="order-update-customizations-btn">
                  Update Customisations
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsOptionsOpen(true)} data-testid="order-update-options-btn">
                  Update Options
                </Button>
              </div>
            )}
          </div>

          {(isAdmin || isPickupCoordinator) && (detail?.address || order?.address) && (() => {
            const address = detail?.address || order?.address;
            return (
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </h3>
                <p className="text-sm text-muted-foreground">
                  {address.name || address.firstName || order.customerName || "—"} · {address.phone || order.customerPhone || "—"}
                  <br />
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  <br />
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            );
          })()}

          {measurements && (
            <div className="rounded-lg border p-2">
              <MeasurementsTable measurements={measurements} />
            </div>
          )}

          {notes && (
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>

        {/* Right column: payment + manage */}
        <div className="space-y-4">
          {!isCuttingAgent && !isStitchingAgent && (
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Payment Summary</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-semibold">₹{Number(totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs", paymentBadge.bg, paymentBadge.text, paymentBadge.border)}>
                  <PaymentIcon className="w-3 h-3" /> {paymentBadge.label}
                </span>
              </div>
              {detail?.payment?.method && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{detail.payment.method}</span>
                </div>
              )}
              {detail?.payment?._id && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-medium break-all text-right">{detail.payment._id}</span>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border p-4 space-y-4" data-testid="order-manage-panel">
            <h3 className="text-sm font-semibold">Manage Order</h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Processing State</label>
                {isPickupCoordinator ? (
                  <Select
                    value={
                      currentProcessingState === OrderProcessingState.ORDER_FULFILLED
                        ? OrderProcessingState.ORDER_FULFILLED
                        : OrderProcessingState.ORDER_PLACED
                    }
                    onValueChange={(val) => handleProcessingStateChange(val)}
                  >
                    <SelectTrigger
                      disabled={!canEdit || isReadOnlyProcessingState}
                      data-testid="order-processing-state-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderProcessingState.ORDER_PLACED}>Order Placed</SelectItem>
                      <SelectItem value={OrderProcessingState.ORDER_FULFILLED}>Order Fulfilled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : isCuttingAgent ? (
                  <Select
                    value={
                      currentProcessingState === OrderProcessingState.CUTTING_END
                        ? OrderProcessingState.CUTTING_END
                        : currentProcessingState === OrderProcessingState.CUTTING_START
                          ? OrderProcessingState.CUTTING_START
                          : OrderProcessingState.ORDER_FULFILLED
                    }
                    onValueChange={(val) => handleProcessingStateChange(val)}
                  >
                    <SelectTrigger
                      disabled={!canEdit && user?.role !== UserRole.CUTTING}
                      data-testid="order-processing-state-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderProcessingState.ORDER_FULFILLED}>
                        Order Fulfilled
                      </SelectItem>
                      <SelectItem value={OrderProcessingState.CUTTING_START}>
                        Cutting Started / कटिंग शुरू
                      </SelectItem>
                      <SelectItem value={OrderProcessingState.CUTTING_END}>
                        Cutting Ended / कटिंग खत्म
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : isStitchingAgent ? (
                  <Select
                    value={
                      currentProcessingState === OrderProcessingState.STITCHING_END
                        ? OrderProcessingState.STITCHING_END
                        : currentProcessingState === OrderProcessingState.STITCHING_START
                          ? OrderProcessingState.STITCHING_START
                          : OrderProcessingState.CUTTING_END
                    }
                    onValueChange={(val) => handleProcessingStateChange(val)}
                  >
                    <SelectTrigger
                      disabled={!canEdit && user?.role !== UserRole.STITCHING}
                      data-testid="order-processing-state-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderProcessingState.CUTTING_END}>
                        Cutting Ended / कटिंग खत्म
                      </SelectItem>
                      <SelectItem value={OrderProcessingState.STITCHING_START}>
                        Stitching Started / सिलाई शुरू
                      </SelectItem>
                      <SelectItem value={OrderProcessingState.STITCHING_END}>
                        Stitching Ended / सिलाई खत्म
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={currentProcessingState || OrderProcessingState.ORDER_PLACED}
                    onValueChange={(val) => handleProcessingStateChange(val)}
                  >
                    <SelectTrigger disabled={!canEdit} data-testid="order-processing-state-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCESSING_STAGE_SEQUENCE.map((stage) => (
                        <SelectItem key={stage} value={stage}>{STAGE_LABELS[stage]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {!isPickupCoordinator && !isCuttingAgent && !isStitchingAgent && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Order Status</label>
                  <Select
                    value={order.orderStatus || ""}
                    onValueChange={(val) => onUpdateOrderStatus(order.id, val)}
                  >
                    <SelectTrigger disabled={!canEdit} data-testid="order-status-select">
                      <SelectValue placeholder="Keep current" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_EDIT_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isCuttingAgent && !isStitchingAgent && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Cutting Agent</label>
                  <Select
                    value={activeCuttingAgentValue}
                    onValueChange={(val) => handleCuttingAgentChange(val)}
                  >
                    <SelectTrigger
                      disabled={!canEdit && user?.role !== UserRole.PICKUP_COORDINATOR && user?.role !== UserRole.ADMIN}
                      data-testid="order-cutting-agent-select"
                    >
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {filteredCuttingAgents.map((agent: any) => {
                        const agentId = agent._id || agent.userId || agent.id;
                        return (
                          <SelectItem key={agentId} value={agentId}>
                            {`${agent.firstName || agent.name || ""} ${agent.lastName || ""}`.trim() || agent.email}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isPickupCoordinator && !isStitchingAgent && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Stitching Agent</label>
                  <Select
                    value={activeStitchingAgentValue}
                    onValueChange={(val) => handleStitchingAgentChange(val)}
                  >
                    <SelectTrigger disabled={(!canEdit && !isCuttingAgent) || isAssigningToStitchingAgent} data-testid="order-stitching-agent-select">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {filteredStitchingAgents.map((agent: any) => {
                        const agentId = agent._id || agent.userId || agent.id;
                        return (
                          <SelectItem key={agentId} value={agentId}>
                            {`${agent.firstName || agent.name || ""} ${agent.lastName || ""}`.trim() || agent.email}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isCuttingAgent && !isStitchingAgent && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Pin to Top</label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      disabled={isUpdatingPin || !canEdit}
                      checked={!!order.isPinned}
                      onCheckedChange={(val) => {
                        const pinPosition = val ? window.prompt("Enter pin position") : null;
                        onPinOrder(order.id, val, pinPosition ? Number(pinPosition) : null);
                      }}
                      data-testid="order-pin-switch"
                    />
                    {isUpdatingPin && <Loader2 className="w-4 h-4 animate-spin" />}
                    {order.isPinned && (
                      <span className="text-xs text-muted-foreground">#{order.pinPosition ?? "-"}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isCuttingAgent && !isStitchingAgent && (
              <div className="pt-2 border-t">
                <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                  <MessageSquareText className="w-3 h-3" /> Notify Customer (SMS)
                </label>
                <div className="flex flex-wrap gap-2">
                  {NOTIFY_STAGES.map((stage) => (
                    <Button
                      key={stage.value}
                      size="sm"
                      variant="outline"
                      disabled={isNotifying}
                      onClick={() => notifyCustomer(stage.value)}
                      data-testid={`notify-customer-${stage.value}`}
                    >
                      {isNotifying && notifyVars === stage.value ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : null}
                      {stage.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showAdminActions && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditMeasurements(order.id, measurements)}
                  data-testid="order-edit-measurements-btn"
                >
                  <RulerIcon className="w-4 h-4 mr-1" /> Measurements
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDuplicating}
                  onClick={() => onDuplicate(order.id)}
                  data-testid="order-duplicate-btn"
                >
                  {isDuplicating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Repeat className="w-4 h-4 mr-1" />}
                  Repeat Order
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onDelete(order.id)}
                  data-testid="order-delete-btn"
                >
                  <Trash className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline (collapsible) */}
      <div className="rounded-lg border">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
          onClick={() => setShowTimeline((v) => !v)}
          data-testid="order-timeline-toggle"
        >
          Order Timeline
          {showTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showTimeline && (
          <div className="px-2 pb-3">
            {order.timeLine?.length > 0 ? (
              <OrderTimelineView timeline={order.timeLine} />
            ) : (
              <p className="text-sm text-muted-foreground px-2">No timeline events yet.</p>
            )}
          </div>
        )}
      </div>

      <UpdateOrderCustomizations
        orderId={order.id}
        isOpen={isCustomizationsOpen}
        onOpenChange={setIsCustomizationsOpen}
        onSuccess={() => {
          refreshDetail();
          setIsCustomizationsOpen(false);
        }}
      />
      <UpdateOrderOptions
        orderId={order.id}
        isOpen={isOptionsOpen}
        onOpenChange={setIsOptionsOpen}
        onSuccess={() => {
          refreshDetail();
          setIsOptionsOpen(false);
        }}
      />
    </div>
  );
};

export default AdminOrderDetailView;
