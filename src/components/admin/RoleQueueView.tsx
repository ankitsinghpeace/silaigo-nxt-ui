"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowRight, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getAllOrders, updateOrdersProcessingState } from "@/services/modules/orders.api";
import {
  ROLE_QUEUE_STAGE,
  ROLE_COMPLETION_STAGE,
  ROLE_QUEUE_TITLE,
  STAGE_LABELS,
  getDeliveryUrgency,
  URGENCY_STYLES,
} from "@/lib/orderStageConfig";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/auth.api";
import {
  getAssignedCuttingAgentMap,
  setAssignedCuttingAgent,
  CuttingAgentAssignment,
} from "@/lib/cuttingAgentStore";

interface RoleQueueViewProps {
  role: "CUTTING" | "STITCHING";
  onOpenOrder: (orderId: string) => void;
  canEdit: boolean;
  cuttingAgents?: any[];
}

const RoleQueueView: React.FC<RoleQueueViewProps> = ({
  role,
  onOpenOrder,
  canEdit,
  cuttingAgents = [],
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queueStage = ROLE_QUEUE_STAGE[role];
  const completionStage = ROLE_COMPLETION_STAGE[role];

  const activeCuttingAgents = useMemo(() => {
    return Array.isArray(cuttingAgents) ? cuttingAgents : [];
  }, [cuttingAgents]);

  const [assignedMap, setAssignedMap] = useState<Record<string, CuttingAgentAssignment>>(() =>
    getAssignedCuttingAgentMap()
  );

  const loggedInAgent = useMemo(() => {
    if (!user) return null;
    return activeCuttingAgents.find((a: any) => {
      const aId = String(a._id || a.userId || a.id || "").toLowerCase();
      const aEmail = String(a.email || "").toLowerCase();
      const uId = String((user as any).id || (user as any)._id || (user as any).userId || "").toLowerCase();
      const uEmail = String(user.email || "").toLowerCase();
      return (uId && aId === uId) || (uEmail && aEmail === uEmail);
    });
  }, [user, activeCuttingAgents]);

  const [filterAgentId, setFilterAgentId] = useState<string>("ALL");

  // If logged in as a CUTTING user, default filter to their assigned agent ID
  useEffect(() => {
    if (user?.role === UserRole.CUTTING && loggedInAgent) {
      const id = loggedInAgent._id || loggedInAgent.userId || loggedInAgent.id;
      setFilterAgentId(id);
    }
  }, [user?.role, loggedInAgent]);

  useEffect(() => {
    const handleAssignedEvent = () => {
      setAssignedMap(getAssignedCuttingAgentMap());
    };
    window.addEventListener("cuttingAgentAssigned", handleAssignedEvent);
    return () => {
      window.removeEventListener("cuttingAgentAssigned", handleAssignedEvent);
    };
  }, []);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["role-queue", role],
    queryFn: () =>
      getAllOrders(
        new URLSearchParams({
          page: "1",
          limit: "100",
          sortBy: "newest",
          sortByDeliveryDate: "1",
        }).toString(),
      ),
    staleTime: 1000 * 30,
  });

  // Auto-assign fulfilled orders to single cutting master if only 1 exists
  useEffect(() => {
    if (role === "CUTTING" && activeCuttingAgents.length === 1 && data?.orders) {
      const singleAgent = activeCuttingAgents[0];
      const singleAgentId = singleAgent._id || singleAgent.userId || singleAgent.id;
      const singleAgentName =
        `${singleAgent.firstName || singleAgent.name || ""} ${singleAgent.lastName || ""}`.trim() || singleAgent.email;

      const fulfilledOrders = (data.orders || []).filter(
        (o: any) => o.orderProcessingState === queueStage,
      );

      let mapChanged = false;
      fulfilledOrders.forEach((o: any) => {
        const orderId = o.id || o._id;
        const currentAssign = assignedMap[orderId];
        if (!currentAssign || !currentAssign.agentId) {
          setAssignedCuttingAgent(orderId, singleAgentId, singleAgentName);
          mapChanged = true;
        }
      });

      if (mapChanged) {
        setAssignedMap(getAssignedCuttingAgentMap());
      }
    }
  }, [role, activeCuttingAgents, data?.orders, queueStage, assignedMap]);

  const queueOrders = useMemo(() => {
    const orders = data?.orders || [];
    let filtered = orders.filter(
      (o: any) =>
        o.orderProcessingState === queueStage ||
        (role === "CUTTING" && o.orderProcessingState === "CUTTING_START"),
    );

    if (role === "CUTTING" && filterAgentId !== "ALL") {
      filtered = filtered.filter((o: any) => {
        const orderId = o.id || o._id;
        const assignment = assignedMap[orderId];

        if (filterAgentId === "UNASSIGNED") {
          return !assignment || !assignment.agentId;
        }

        if (!assignment || !assignment.agentId) return false;

        const targetAgent = activeCuttingAgents.find(
          (a: any) => (a._id || a.userId || a.id) === filterAgentId
        );

        const targetId = targetAgent ? (targetAgent._id || targetAgent.userId || targetAgent.id) : filterAgentId;
        const targetEmail = targetAgent?.email;
        const targetName = targetAgent
          ? `${targetAgent.firstName || targetAgent.name || ""} ${targetAgent.lastName || ""}`.trim()
          : "";

        return (
          assignment.agentId === targetId ||
          (targetEmail && assignment.agentId === targetEmail) ||
          (targetName && assignment.agentName?.toLowerCase() === targetName.toLowerCase())
        );
      });
    }

    return filtered.sort((a: any, b: any) => {
      const da = a.appointmentDate ? new Date(a.appointmentDate).getTime() : Infinity;
      const db = b.appointmentDate ? new Date(b.appointmentDate).getTime() : Infinity;
      return da - db;
    });
  }, [data, queueStage, role, filterAgentId, assignedMap, activeCuttingAgents]);

  const { mutate: advanceStage, isPending: isAdvancing, variables } = useMutation({
    mutationFn: (orderId: string) =>
      updateOrdersProcessingState(orderId, { nextState: completionStage }),
    onSuccess: () => {
      toast({ title: "Moved to next stage", description: STAGE_LABELS[completionStage] });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast({ title: "Couldn't update order", description: generateErrorMessage(error), variant: "destructive" });
    },
  });

  const handleAssignAgent = (orderId: string, agentId: string) => {
    const selectedAgent = activeCuttingAgents.find(
      (a: any) => (a._id || a.userId || a.id) === agentId
    );
    const agentName = selectedAgent
      ? `${selectedAgent.firstName || selectedAgent.name || ""} ${selectedAgent.lastName || ""}`.trim()
      : undefined;

    setAssignedCuttingAgent(orderId, agentId === "none" ? "" : agentId, agentName);
    setAssignedMap(getAssignedCuttingAgentMap());
    toast({ title: "Cutting agent assigned successfully" });
  };

  return (
    <div className="space-y-4" data-testid={`role-queue-${role.toLowerCase()}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{ROLE_QUEUE_TITLE[role]}</h2>
          <p className="text-sm text-muted-foreground">
            Orders waiting on your team, sorted by nearest delivery date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === "CUTTING" && activeCuttingAgents.length > 0 && (
            <Select value={filterAgentId} onValueChange={setFilterAgentId}>
              <SelectTrigger className="w-[200px] h-9 text-xs">
                <SelectValue placeholder="Filter agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Cutting Orders</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned Only</SelectItem>
                {activeCuttingAgents.map((agent: any) => {
                  const agentId = agent._id || agent.userId || agent.id;
                  const name = `${agent.firstName || agent.name || ""} ${agent.lastName || ""}`.trim() || agent.email;
                  const isMe = loggedInAgent && (agent._id === loggedInAgent._id || agent.userId === loggedInAgent.userId || agent.email === loggedInAgent.email);
                  return (
                    <SelectItem key={agentId} value={agentId}>
                      {name} {isMe ? "(Assigned to Me)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh {isPending && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
          </Button>
        </div>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading queue...</p>
      ) : queueOrders.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Nothing in your queue right now. 🎉
        </div>
      ) : (
        <div className="rounded-lg border divide-y overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
            <div className="col-span-12 sm:col-span-4">Order & Customer</div>
            <div className="col-span-6 sm:col-span-3">Delivery Date</div>
            <div className="col-span-6 sm:col-span-2">Urgency</div>
            <div className="col-span-12 sm:col-span-3">
              {role === "CUTTING" ? "Cutting Agent" : "Stitching Agent"}
            </div>
          </div>
          {queueOrders.map((order: any) => {
            const orderId = order.id || order._id;
            const urgency = getDeliveryUrgency(order.appointmentDate);
            const assignment = assignedMap[orderId];

            return (
              <div
                key={orderId}
                className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm hover:bg-muted/40 cursor-pointer"
                onClick={() => onOpenOrder(orderId)}
                data-testid={`queue-order-row-${orderId}`}
              >
                <div className="col-span-12 sm:col-span-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => onOpenOrder(orderId)}
                    className="font-mono text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    {order.orderId}
                  </button>
                  <div className="font-medium truncate">{order.customerName}</div>
                </div>

                <div className="col-span-6 sm:col-span-3 text-xs text-muted-foreground">
                  {order.appointmentDate && !isNaN(new Date(order.appointmentDate).getTime())
                    ? format(new Date(order.appointmentDate), "dd MMM yyyy")
                    : "No date"}
                  {order.appointmentTime ? ` · ${order.appointmentTime}` : ""}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      URGENCY_STYLES[urgency.level],
                    )}
                  >
                    <Clock className="w-3 h-3" /> {urgency.label}
                  </span>
                </div>

                {role === "CUTTING" && (
                  <div className="col-span-12 sm:col-span-3" onClick={(e) => e.stopPropagation()}>
                    {activeCuttingAgents.length > 0 ? (
                      <Select
                        value={assignment?.agentId || "none"}
                        onValueChange={(val) => handleAssignAgent(orderId, val)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Assign Agent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {activeCuttingAgents.map((agent: any) => {
                            const agentId = agent._id || agent.userId || agent.id;
                            return (
                              <SelectItem key={agentId} value={agentId}>
                                {`${agent.firstName || agent.name || ""} ${agent.lastName || ""}`.trim() || agent.email}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-muted-foreground" />
                        {assignment?.agentName || "Unassigned"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoleQueueView;
