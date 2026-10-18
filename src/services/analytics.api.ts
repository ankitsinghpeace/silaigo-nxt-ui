import { apiFetch } from "@/hooks/interceptor";

export interface DateRange {
  from: string;
  to: string;
}

export interface OverviewKPIs {
  totalOrders: number;
  revenue: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  returns: number;
  deltas: {
    totalOrders: number;
    revenue: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    returns: number;
  };
}

export interface DailyFlow {
  date: string;
  iso: string;
  incomingCount: number;
  incomingValue: number;
  outgoingCount: number;
  outgoingValue: number;
}

export interface CategoryStat {
  category: string;
  completed: number;
  inProgress: number;
  notStarted: number;
  returned: number;
  revenue: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
}

export interface OverviewResponse {
  kpis: OverviewKPIs;
  dailyFlow: DailyFlow[];
  categoryStats: CategoryStat[];
  statusDistribution: StatusDistribution[];
}

export interface FinanceKPIs {
  totalRevenue: number;
  completedValue: number;
  pendingValue: number;
  avgOrderValue: number;
  refunds: number;
  netRevenue: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface PaymentMethod {
  name: string;
  value: number;
}

export interface OrderValueBucket {
  range: string;
  count: number;
}

export interface FinanceResponse {
  kpis: FinanceKPIs;
  dailyFlow: DailyFlow[];
  categoryRevenue: CategoryRevenue[];
  paymentMethods: PaymentMethod[];
  orderValueBuckets: OrderValueBucket[];
}

export interface OperationsKPIs {
  ordersInQueue: number;
  estimatedWorkloadHours: number;
  avgCompletionDays: number;
  onTimeCompletionPct: number;
  delayedOrders: number;
  unassignedOrders: number;
}

export interface ProductionStage {
  stage: string;
  count: number;
  pct: number;
}

export interface Bottleneck {
  stage: string;
  count: number;
}

export interface EmployeeEfficiency {
  id: string;
  name: string;
  role: string;
  assigned: number;
  completed: number;
  avgHours: number;
  targetHours: number;
  onTimePct: number;
  activeLoad: number;
  capacity: number;
}

export interface CategoryQueue {
  category: string;
  avgDays: number;
  targetDays: number;
  inQueue: number;
  estQueueHours: number;
}

export interface OperationsResponse {
  kpis: OperationsKPIs;
  productionStages: ProductionStage[];
  bottlenecks: Bottleneck[];
  employeeEfficiency: EmployeeEfficiency[];
  categoryQueue: CategoryQueue[];
}

export interface OrderRecord {
  id: string;
  customer: string;
  phone: string;
  product: string;
  category: string;
  employee: string;
  role: string;
  stage: string;
  status: string;
  payment: string;
  method: string;
  value: number;
  orderDate: string;
  deliveryDate: string;
  hours: number;
}

export interface OrdersResponse {
  orders: OrderRecord[];
  total: number;
  summary: {
    totalValue: number;
  };
}

export interface OrdersQuery extends DateRange {
  status?: string;
  category?: string;
  employee?: string;
  payment?: string;
  search?: string;
  sortBy?: "date-desc" | "date-asc" | "value-desc" | "value-asc" | "delivery";
  page?: number;
  limit?: number;
}

export const getOverview = async (range: DateRange): Promise<OverviewResponse> => {
  const res = await apiFetch<OverviewResponse>("analytics/overview", {
    method: "GET",
    auth: true,
    params: range,
  });
  return res.data;
};

export const getFinance = async (range: DateRange): Promise<FinanceResponse> => {
  const res = await apiFetch<FinanceResponse>("analytics/finance", {
    method: "GET",
    auth: true,
    params: range,
  });
  return res.data;
};

export const getOperations = async (range: DateRange): Promise<OperationsResponse> => {
  const res = await apiFetch<OperationsResponse>("analytics/operations", {
    method: "GET",
    auth: true,
    params: range,
  });
  return res.data;
};

export const getOrders = async (query: OrdersQuery): Promise<OrdersResponse> => {
  const res = await apiFetch<OrdersResponse>("analytics/orders", {
    method: "GET",
    auth: true,
    params: query,
  });
  return res.data;
};
