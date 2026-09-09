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
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { uploadToS3 } from "@/lib/uploadFile";
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
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Paid", icon: CheckCircle };
    case PaymentStatus.FAILED:
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Failed", icon: XCircle };
    default:
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending", icon: DollarSign };
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
  onUpdateProcessingState: (
    orderId: string,
    nextState: string,
    extraData?: { notes?: string; alterationPhotos?: string[] }
  ) => void;
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
  const getCuttingAgentFromObject = React.useCallback((obj: any) => {
    if (!obj) return null;
    const storeVal = getAssignedCuttingAgent(obj.id || obj._id);
    if (storeVal?.agentId) return storeVal;
    const agentId =
      obj.assignedToCuttingAgentId ||
      obj.assignedCuttingAgentId ||
      obj.cuttingAgentId ||
      obj.assignedCuttingAgent?._id ||
      obj.assignedCuttingAgent?.userId ||
      obj.assignedCuttingAgent?.id;
    const agentName =
      obj.assignedCuttingAgentName ||
      obj.assignedCuttingAgent?.name ||
      (obj.assignedCuttingAgent
        ? `${obj.assignedCuttingAgent.firstName || ""} ${obj.assignedCuttingAgent.lastName || ""}`.trim()
        : undefined);
    if (agentId) return { agentId, agentName };
    return null;
  }, []);

  const [assignedCuttingAgentState, setAssignedCuttingAgentState] = useState(() =>
    getCuttingAgentFromObject(order)
  );

  const isAdmin = user?.role === UserRole.ADMIN;
  const isPickupCoordinator = user?.role === UserRole.PICKUP_COORDINATOR;
  const isCuttingAgent = user?.role === UserRole.CUTTING;
  const isStitchingAgent = user?.role === UserRole.STITCHING;
  const isSupport = user?.role === UserRole.SUPPORT || user?.role?.toUpperCase() === "SUPPORT";

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

  const [isAlterationDialogOpen, setIsAlterationDialogOpen] = useState(false);
  const [alterationNotes, setAlterationNotes] = useState<string>(
    order.alterationNotes || order.alteration_notes || ""
  );
  const [alterationPhotos, setAlterationPhotos] = useState<string[]>(
    order.alterationPhotos || order.alteration_photos || []
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const { data: detail, isLoading } = useQuery({
    queryKey: ["order-detail", order.id],
    queryFn: () => getOrderByIdApi(order.id),
    staleTime: 1000 * 60 * 2,
    retry: 0,
  });

  React.useEffect(() => {
    const target = detail?.order || detail || order;
    if (target) {
      const state = target.orderProcessingState || target.processingState;
      if (state) {
        setCurrentProcessingState(state);
      }
      const agent = getCuttingAgentFromObject(target);
      if (agent?.agentId) {
        setAssignedCuttingAgentState(agent);
        setAssignedCuttingAgent(target.id || target._id || order.id || order._id, agent.agentId, agent.agentName);
      }
      const notesVal = target.alterationNotes ?? target.alteration_notes;
      if (notesVal !== undefined) {
        setAlterationNotes(notesVal || "");
      }
      const photosVal = target.alterationPhotos ?? target.alteration_photos;
      if (photosVal !== undefined && Array.isArray(photosVal)) {
        setAlterationPhotos(photosVal);
      }
    }
  }, [order, detail, getCuttingAgentFromObject]);

  const handleProcessingStateSelect = (val: string) => {
    if (val === OrderProcessingState.RETURNED) {
      setIsAlterationDialogOpen(true);
    } else {
      handleProcessingStateChange(val);
    }
  };

  const handleProcessingStateChange = (
    nextState: string,
    extraData?: { notes?: string; alterationPhotos?: string[] }
  ) => {
    setCurrentProcessingState(nextState);
    if (extraData?.notes !== undefined) {
      setAlterationNotes(extraData.notes);
    }
    if (extraData?.alterationPhotos !== undefined) {
      setAlterationPhotos(extraData.alterationPhotos);
    }
    onUpdateProcessingState(order.id || order._id, nextState, extraData);

    if (nextState === OrderProcessingState.RETURNED || nextState === OrderProcessingState.ORDER_FULFILLED) {
      let existingAgent = assignedCuttingAgentState || getCuttingAgentFromObject(detail?.order || detail || order);
      if (!existingAgent?.agentId && filteredCuttingAgents.length === 1) {
        const singleAgent = filteredCuttingAgents[0];
        const singleAgentId = singleAgent._id || singleAgent.userId || singleAgent.id;
        const singleAgentName =
          `${singleAgent.firstName || singleAgent.name || ""} ${singleAgent.lastName || ""}`.trim() || singleAgent.email;
        existingAgent = { agentId: singleAgentId, agentName: singleAgentName };
      }

      if (existingAgent?.agentId) {
        setAssignedCuttingAgent(order.id || order._id, existingAgent.agentId, existingAgent.agentName);
        setAssignedCuttingAgentState(existingAgent);
        if (onAssignCuttingAgent) {
          onAssignCuttingAgent(order.id || order._id, existingAgent.agentId, existingAgent.agentName);
        }
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);

    try {
      const uploadPromises = Array.from(files).map((file) => {
        const fileInfo = {
          resourceName: "orders",
          resourceId: order.id || order._id || "alteration",
          subResourceName: "alteration",
          subResourceId: "photos",
          fileName: file.name,
          filename: file.name,
          name: file.name,
          fileType: file.type || "image/jpeg",
          fileSize: file.size,
          type: file.type || "image/jpeg",
          size: file.size,
        };
        return uploadToS3(fileInfo, file);
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(Boolean);
      setAlterationPhotos((prev) => [...prev, ...validUrls]);
      toast({ title: `${validUrls.length} photo(s) uploaded successfully` });
    } catch (err: any) {
      toast({
        title: "Photo upload failed",
        description: generateErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setAlterationPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAlteration = () => {
    handleProcessingStateChange(OrderProcessingState.RETURNED, {
      notes: alterationNotes,
      alterationPhotos: alterationPhotos,
    });
    setIsAlterationDialogOpen(false);
    toast({ title: "Order marked as Returned for Alteration" });
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
            value: (() => {
              const d = order.appointmentDate || detail?.appointment?.date || detail?.order?.appointmentDate;
              const t = order.appointmentTime || detail?.appointment?.time || detail?.order?.appointmentTime;
              if (d && !isNaN(new Date(d).getTime())) {
                return `${format(new Date(d), "dd MMM yyyy")}${t ? ` · ${t}` : ""}`;
              }
              return "N/A";
            })(),
          },
          {
            label: "Order Date",
            value: (() => {
              const od = order.orderDate || detail?.order?.orderDate || detail?.order?.createdAt || detail?.createdAt;
              if (od && !isNaN(new Date(od).getTime())) {
                return format(new Date(od), "dd MMM yyyy, hh:mm a");
              }
              return "N/A";
            })(),
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
                      [
                        OrderProcessingState.MATERIAL_PACKED,
                        OrderProcessingState.READY_FOR_DISPATCH,
                        OrderProcessingState.DELIVERED_AND_PAID,
                        OrderProcessingState.ORDER_COMPLETE,
                        OrderProcessingState.RETURNED,
                      ].includes(currentProcessingState as OrderProcessingState)
                        ? currentProcessingState
                        : OrderProcessingState.MATERIAL_PACKED
                    }
                    onValueChange={(val) => handleProcessingStateSelect(val)}
                  >
                    <SelectTrigger
                      disabled={(!canEdit && !isPickupCoordinator) || Boolean(isReadOnlyProcessingState)}
                      data-testid="order-processing-state-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderProcessingState.MATERIAL_PACKED}>Packed / पैक</SelectItem>
                      <SelectItem value={OrderProcessingState.READY_FOR_DISPATCH}>Out for Delivery</SelectItem>
                      <SelectItem value={OrderProcessingState.DELIVERED_AND_PAID}>Delivered and Paid</SelectItem>
                      <SelectItem value={OrderProcessingState.ORDER_COMPLETE}>Delivered</SelectItem>
                      <SelectItem value={OrderProcessingState.RETURNED}>Returned for Alteration</SelectItem>
                    </SelectContent>
                  </Select>
                ) : isCuttingAgent ? (
                  <Select
                    value={
                      [
                        OrderProcessingState.RETURNED,
                        OrderProcessingState.ALTERATION_START,
                        OrderProcessingState.MATERIAL_PACKED,
                      ].includes(currentProcessingState as OrderProcessingState)
                        ? currentProcessingState
                        : currentProcessingState === OrderProcessingState.CUTTING_END
                          ? OrderProcessingState.CUTTING_END
                          : currentProcessingState === OrderProcessingState.CUTTING_START
                            ? OrderProcessingState.CUTTING_START
                            : OrderProcessingState.ORDER_FULFILLED
                    }
                    onValueChange={(val) => handleProcessingStateSelect(val)}
                  >
                    <SelectTrigger
                      disabled={!canEdit && user?.role !== UserRole.CUTTING}
                      data-testid="order-processing-state-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        OrderProcessingState.RETURNED,
                        OrderProcessingState.ALTERATION_START,
                        OrderProcessingState.MATERIAL_PACKED,
                      ].includes(currentProcessingState as OrderProcessingState) ? (
                        <>
                          <SelectItem value={OrderProcessingState.RETURNED}>Returned for Alteration</SelectItem>
                          <SelectItem value={OrderProcessingState.ALTERATION_START}>
                            Alteration Started / अल्टरेशन शुरू
                          </SelectItem>
                          <SelectItem value={OrderProcessingState.MATERIAL_PACKED}>Packed / पैक</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value={OrderProcessingState.ORDER_FULFILLED}>
                            Order Fulfilled
                          </SelectItem>
                          <SelectItem value={OrderProcessingState.CUTTING_START}>
                            Cutting Started / कटिंग शुरू
                          </SelectItem>
                          <SelectItem value={OrderProcessingState.CUTTING_END}>
                            Cutting Ended / कटिंग खत्म
                          </SelectItem>
                        </>
                      )}
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
                    onValueChange={(val) => handleProcessingStateSelect(val)}
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
                ) : isSupport ? (
                  <Select
                    value={
                      [
                        OrderProcessingState.MATERIAL_PACKED,
                        OrderProcessingState.PRODUCT_VERIFIED_OR_RECTIFIED,
                        OrderProcessingState.STITCHING_END,
                        OrderProcessingState.RETURNED,
                      ].includes(currentProcessingState as OrderProcessingState)
                        ? currentProcessingState
                        : currentProcessingState || OrderProcessingState.MATERIAL_PACKED
                    }
                    onValueChange={(val) => handleProcessingStateSelect(val)}
                  >
                    <SelectTrigger
                      disabled={!canEdit && !isSupport}
                      data-testid="order-processing-state-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderProcessingState.STITCHING_END}>
                        {STAGE_LABELS[OrderProcessingState.STITCHING_END]}
                      </SelectItem>
                      <SelectItem value={OrderProcessingState.PRODUCT_VERIFIED_OR_RECTIFIED}>
                        {STAGE_LABELS[OrderProcessingState.PRODUCT_VERIFIED_OR_RECTIFIED]}
                      </SelectItem>
                      <SelectItem value={OrderProcessingState.MATERIAL_PACKED}>
                        {STAGE_LABELS[OrderProcessingState.MATERIAL_PACKED]}
                      </SelectItem>
                      <SelectItem value={OrderProcessingState.RETURNED}>
                        {STAGE_LABELS[OrderProcessingState.RETURNED]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={currentProcessingState || OrderProcessingState.ORDER_PLACED}
                    onValueChange={(val) => handleProcessingStateSelect(val)}
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

              {/* Alteration Details & Photos Card */}
              {(() => {
                const cleanAltNotes = (alterationNotes || "").trim();
                const hasAltNotes =
                  cleanAltNotes !== "" &&
                  cleanAltNotes !== "-" &&
                  cleanAltNotes.toUpperCase() !== "N/A";
                const hasAltPhotos = alterationPhotos.length > 0;
                const isReturnedState = currentProcessingState === OrderProcessingState.RETURNED;
                const shouldShow = isReturnedState || hasAltNotes || hasAltPhotos;

                if (!shouldShow) return null;

                return (
                  <div className="col-span-12 rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 space-y-2.5 mt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                        <MessageSquareText className="w-4 h-4 text-amber-700" />
                        Alteration Details & Photos
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-white border-amber-300 text-amber-900 hover:bg-amber-100/50"
                        onClick={() => setIsAlterationDialogOpen(true)}
                      >
                        {hasAltNotes || hasAltPhotos ? "Edit Details" : "Add Details"}
                      </Button>
                    </div>

                    {hasAltNotes ? (
                      <p className="text-xs text-amber-950 bg-white p-2.5 rounded border border-amber-200/60 whitespace-pre-wrap">
                        {cleanAltNotes}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No alteration notes added yet.</p>
                    )}

                    {alterationPhotos.length > 0 && (
                      <div>
                        <span className="text-[11px] font-medium text-amber-800 block mb-1.5">
                          Alteration Photos ({alterationPhotos.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {alterationPhotos.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noreferrer" className="group relative">
                              <img
                                src={url}
                                alt={`Alteration photo ${idx + 1}`}
                                className="w-14 h-14 object-cover rounded border border-amber-200 group-hover:opacity-90 transition"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {!isPickupCoordinator && !isCuttingAgent && !isStitchingAgent && !isSupport && (
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

              {!isCuttingAgent && !isStitchingAgent && !isSupport && (
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
                      {assignedCuttingAgentState?.agentId &&
                        !filteredCuttingAgents.some(
                          (a: any) => (a._id || a.userId || a.id) === assignedCuttingAgentState.agentId,
                        ) && (
                          <SelectItem value={assignedCuttingAgentState.agentId}>
                            {assignedCuttingAgentState.agentName || "Assigned Agent"}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isPickupCoordinator && !isStitchingAgent && !isSupport && (
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

              {!isCuttingAgent && !isStitchingAgent && !isSupport && (
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

            {!isCuttingAgent && !isStitchingAgent && !isSupport && (
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

      {/* Returned for Alteration Dialog */}
      <Dialog open={isAlterationDialogOpen} onOpenChange={setIsAlterationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-amber-900">
              <MessageSquareText className="w-5 h-5 text-amber-600" />
              Returned for Alteration Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add alteration notes and upload photos describing what needs to be altered for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Alteration Notes / Instructions
              </label>
              <Textarea
                value={alterationNotes}
                onChange={(e) => setAlterationNotes(e.target.value)}
                placeholder="Describe alteration requirements (e.g., shorten sleeves by 1 inch, adjust bust line...)"
                className="text-xs min-h-[90px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">
                Alteration Photos
              </label>

              {alterationPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {alterationPhotos.map((url, index) => (
                    <div key={index} className="relative group border rounded overflow-hidden h-16 bg-muted">
                      <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md transition border">
                  <Upload className="w-4 h-4" />
                  {isUploadingPhoto ? "Uploading..." : "Upload Photo(s)"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingPhoto}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {isUploadingPhoto && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAlterationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleSubmitAlteration}
              disabled={isUploadingPhoto}
            >
              Save & Mark Returned for Alteration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderDetailView;
