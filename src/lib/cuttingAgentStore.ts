/**
 * Persistent client-side store for Cutting Agent assignments.
 *
 * Maps orderId -> { agentId: string, agentName?: string, assignedAt?: string }
 */

export interface CuttingAgentAssignment {
  agentId: string;
  agentName?: string;
  assignedAt?: string;
}

const STORAGE_KEY = "assignedCuttingAgents_map";

export const getAssignedCuttingAgentMap = (): Record<
  string,
  CuttingAgentAssignment
> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const getAssignedCuttingAgent = (
  orderId: string,
): CuttingAgentAssignment | null => {
  const map = getAssignedCuttingAgentMap();
  return map[orderId] || null;
};

export const setAssignedCuttingAgent = (
  orderId: string,
  agentId: string,
  agentName?: string,
): void => {
  if (typeof window === "undefined") return;
  try {
    const map = getAssignedCuttingAgentMap();
    if (!agentId) {
      delete map[orderId];
    } else {
      map[orderId] = {
        agentId,
        agentName,
        assignedAt: new Date().toISOString(),
      };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent("cuttingAgentAssigned", {
        detail: { orderId, agentId, agentName },
      }),
    );
  } catch (e) {}
};
