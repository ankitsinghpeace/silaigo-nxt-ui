/**
 * Sample (placeholder) analytics data for the admin dashboard.
 *
 * The real endpoints are not available yet, so every panel reads from here.
 * Each export maps 1:1 to a future API response shape — swapping in a real
 * fetch later only means replacing the constant with query data.
 *
 *  employeeEfficiency        -> GET /analytics/employees/efficiency
 *  categoryCompletionTimes   -> GET /analytics/categories/completion-time
 *  queueEstimate             -> GET /analytics/queue/estimate
 *  categoryStats             -> GET /analytics/categories/stats
 *  dailyFlow                 -> GET /analytics/orders/daily-flow
 *  activeOrders              -> GET /orders/active
 *  revenueByCategory         -> GET /analytics/revenue/by-category
 */

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

export const employeeEfficiency: EmployeeEfficiency[] = [
  { id: "e1", name: "Ramesh Kumar", role: "Cutting", assigned: 46, completed: 41, avgHours: 3.2, targetHours: 4, onTimePct: 92, activeLoad: 12, capacity: 15 },
  { id: "e2", name: "Sunita Devi", role: "Stitching", assigned: 52, completed: 44, avgHours: 8.4, targetHours: 8, onTimePct: 83, activeLoad: 10, capacity: 12 },
  { id: "e3", name: "Aamir Khan", role: "Alteration", assigned: 28, completed: 26, avgHours: 2.1, targetHours: 2.5, onTimePct: 90, activeLoad: 9, capacity: 10 },
  { id: "e4", name: "Priya Sharma", role: "Quality Check", assigned: 61, completed: 58, avgHours: 0.8, targetHours: 1, onTimePct: 95, activeLoad: 8, capacity: 14 },
  { id: "e5", name: "Manoj Yadav", role: "Packing", assigned: 39, completed: 37, avgHours: 0.6, targetHours: 0.75, onTimePct: 88, activeLoad: 7, capacity: 12 },
  { id: "e6", name: "Kavita Rani", role: "Stitching", assigned: 34, completed: 25, avgHours: 9.6, targetHours: 8, onTimePct: 70, activeLoad: 11, capacity: 12 },
];

export interface CategoryCompletion {
  category: string;
  avgDays: number;
  targetDays: number;
  inQueue: number;
  estQueueHours: number;
}

export const categoryCompletionTimes: CategoryCompletion[] = [
  { category: "Sarees", avgDays: 2.4, targetDays: 2, inQueue: 19, estQueueHours: 46 },
  { category: "Men (Shirts/Trousers)", avgDays: 1.8, targetDays: 2, inQueue: 14, estQueueHours: 25 },
  { category: "Women (General)", avgDays: 2.1, targetDays: 2, inQueue: 12, estQueueHours: 25 },
  { category: "Alteration", avgDays: 0.8, targetDays: 1, inQueue: 9, estQueueHours: 7 },
  { category: "Blouse", avgDays: 1.5, targetDays: 1.5, inQueue: 5, estQueueHours: 9 },
  { category: "Lehenga", avgDays: 3.2, targetDays: 3, inQueue: 2, estQueueHours: 20 },
];

export const queueEstimate = {
  ordersInQueue: 61,
  estimatedHours: 132,
  dailyCapacityOrders: 18,
  estimatedCompletionDays: 16.5,
  recommendedNewOrdersPerDay: "8 - 10",
  onTrackPct: 78,
};

export interface CategoryStat {
  category: string;
  completed: number;
  returned: number;
  notStarted: number;
  inProgress: number;
  revenue: number;
}

export const categoryStats: CategoryStat[] = [
  { category: "Sarees", completed: 28, returned: 3, notStarted: 7, inProgress: 14, revenue: 24800 },
  { category: "Men", completed: 18, returned: 1, notStarted: 4, inProgress: 9, revenue: 16200 },
  { category: "Women", completed: 14, returned: 2, notStarted: 3, inProgress: 8, revenue: 11600 },
  { category: "Alteration", completed: 7, returned: 4, notStarted: 3, inProgress: 6, revenue: 6200 },
  { category: "Blouse", completed: 9, returned: 0, notStarted: 2, inProgress: 4, revenue: 4800 },
  { category: "Others", completed: 4, returned: 1, notStarted: 1, inProgress: 3, revenue: 3680 },
];

export interface DailyFlow {
  date: string;
  incomingCount: number;
  incomingValue: number;
  outgoingCount: number;
  outgoingValue: number;
}

export const dailyFlow: DailyFlow[] = [
  { date: "1 Sep", incomingCount: 13, incomingValue: 11200, outgoingCount: 9, outgoingValue: 7800 },
  { date: "2 Sep", incomingCount: 18, incomingValue: 15400, outgoingCount: 12, outgoingValue: 10100 },
  { date: "3 Sep", incomingCount: 23, incomingValue: 19100, outgoingCount: 14, outgoingValue: 11700 },
  { date: "4 Sep", incomingCount: 16, incomingValue: 13800, outgoingCount: 8, outgoingValue: 6900 },
  { date: "5 Sep", incomingCount: 21, incomingValue: 17600, outgoingCount: 13, outgoingValue: 11200 },
  { date: "6 Sep", incomingCount: 22, incomingValue: 18300, outgoingCount: 11, outgoingValue: 9400 },
  { date: "7 Sep", incomingCount: 32, incomingValue: 27200, outgoingCount: 18, outgoingValue: 15600 },
  { date: "8 Sep", incomingCount: 24, incomingValue: 20100, outgoingCount: 15, outgoingValue: 12800 },
  { date: "9 Sep", incomingCount: 26, incomingValue: 21900, outgoingCount: 12, outgoingValue: 10300 },
  { date: "10 Sep", incomingCount: 19, incomingValue: 16200, outgoingCount: 14, outgoingValue: 12100 },
  { date: "11 Sep", incomingCount: 25, incomingValue: 21000, outgoingCount: 16, outgoingValue: 13700 },
  { date: "12 Sep", incomingCount: 17, incomingValue: 14500, outgoingCount: 10, outgoingValue: 8600 },
  { date: "13 Sep", incomingCount: 20, incomingValue: 17100, outgoingCount: 13, outgoingValue: 11000 },
  { date: "14 Sep", incomingCount: 23, incomingValue: 19700, outgoingCount: 15, outgoingValue: 12900 },
];

export interface ActiveOrder {
  id: string;
  cartId: string;
  customer: string;
  product: string;
  category: string;
  employee: string;
  role: string;
  stage: string;
  delivery: string;
  value: number;
}

export const activeOrders: ActiveOrder[] = [
  { id: "04SS0857", cartId: "CART-0404", customer: "Juhi Verma", product: "Straight Suit", category: "Sarees", employee: "Sunita Devi", role: "Stitching", stage: "Stitching", delivery: "20 Sep 2026", value: 400 },
  { id: "04SS0858", cartId: "CART-0404", customer: "Juhi Verma", product: "Blouse", category: "Blouse", employee: "Priya Sharma", role: "Quality Check", stage: "Packed", delivery: "18 Sep 2026", value: 300 },
  { id: "01SK0856", cartId: "CART-0404", customer: "Juhi Verma", product: "Trouser", category: "Men", employee: "Ramesh Kumar", role: "Cutting", stage: "Alteration", delivery: "21 Sep 2026", value: 400 },
  { id: "04SS0855", cartId: "CART-0404", customer: "Juhi Verma", product: "Saree Fall/Pico", category: "Sarees", employee: "Unassigned", role: "—", stage: "Not Started", delivery: "22 Sep 2026", value: 300 },
  { id: "04SS0851", cartId: "CART-0403", customer: "Rahul Mehta", product: "Kurta Set", category: "Men", employee: "Ramesh Kumar", role: "Cutting", stage: "Cutting", delivery: "19 Sep 2026", value: 1200 },
  { id: "04SS0849", cartId: "CART-0402", customer: "Neha Kapoor", product: "Lehenga", category: "Women", employee: "Kavita Rani", role: "Stitching", stage: "Stitching", delivery: "14 Sep 2026", value: 2400 },
  { id: "04SS0842", cartId: "CART-0401", customer: "Vikram Singh", product: "Blazer", category: "Men", employee: "Manoj Yadav", role: "Packing", stage: "Packing", delivery: "17 Sep 2026", value: 2800 },
  { id: "04SS0838", cartId: "CART-0400", customer: "Pooja Nair", product: "Saree Fall", category: "Sarees", employee: "Aamir Khan", role: "Alteration", stage: "Alteration", delivery: "18 Sep 2026", value: 600 },
];

export const overviewKpis = {
  totalOrders: 50,
  revenue: 62480,
  completed: 8,
  inProgress: 42,
  notStarted: 19,
  returns: 2,
  deltas: {
    totalOrders: 12,
    revenue: 18,
    completed: 33,
    inProgress: -5,
    notStarted: -10,
    returns: 100,
  },
};

export const financeKpis = {
  totalRevenue: 62480,
  completedValue: 48920,
  pendingValue: 13560,
  avgOrderValue: 1250,
  refunds: 2480,
  netRevenue: 60000,
};

export const paymentMethods = [
  { name: "UPI", value: 45 },
  { name: "Cash", value: 25 },
  { name: "Card", value: 20 },
  { name: "Wallet", value: 7 },
  { name: "Others", value: 3 },
];

export const orderValueBuckets = [
  { range: "< ₹500", count: 12 },
  { range: "₹500 - 1K", count: 28 },
  { range: "₹1K - 2K", count: 18 },
  { range: "₹2K - 5K", count: 14 },
  { range: "> ₹5K", count: 8 },
];

export const productionStages = [
  { stage: "Not Started", count: 19, pct: 26 },
  { stage: "Cutting", count: 28, pct: 39 },
  { stage: "Stitching", count: 18, pct: 25 },
  { stage: "Quality Check", count: 8, pct: 11 },
  { stage: "Packing", count: 6, pct: 8 },
];

export const bottlenecks = [
  { stage: "Cutting", count: 28 },
  { stage: "Stitching", count: 18 },
  { stage: "Alteration", count: 12 },
  { stage: "Quality Check", count: 6 },
  { stage: "Packing", count: 4 },
];

/* ------------------------------------------------------------------ *
 * Order-level sample records — every dashboard number is derived from
 * this list so date filters and drill-down lists always agree.
 * Future: GET /orders?from=&to=
 * ------------------------------------------------------------------ */

export type OrderStatus = "Completed" | "In Progress" | "Not Started" | "Returned";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export interface OrderRecord {
  id: string;
  cartId: string;
  customer: string;
  phone: string;
  product: string;
  category: string;
  employee: string;
  role: string;
  stage: string;
  status: OrderStatus;
  payment: PaymentStatus;
  method: string;
  value: number;
  orderDate: string;   // ISO yyyy-mm-dd
  deliveryDate: string; // ISO yyyy-mm-dd
  hours: number;
}

const CATEGORIES = ["Sarees", "Men", "Women", "Alteration", "Blouse", "Others"];
const PRODUCTS: Record<string, string[]> = {
  Sarees: ["Saree Fall/Pico", "Saree Pre-pleat", "Designer Saree"],
  Men: ["Shirt", "Trouser", "Kurta Set", "Blazer"],
  Women: ["Straight Suit", "Anarkali", "Lehenga", "Gown"],
  Alteration: ["Hem Alteration", "Size Alteration", "Zip Replacement"],
  Blouse: ["Princess Cut Blouse", "Padded Blouse", "Designer Blouse"],
  Others: ["Curtain Stitch", "Cushion Cover", "Kids Wear"],
};
const CUSTOMERS = [
  "Juhi Verma", "Rahul Mehta", "Neha Kapoor", "Vikram Singh", "Pooja Nair",
  "Gaurav Kapoor", "Anita Desai", "Sameer Joshi", "Ritu Bansal", "Karan Malhotra",
  "Sneha Iyer", "Deepak Rao", "Meera Pillai", "Arjun Reddy", "Tanvi Shah",
];
const METHODS = ["UPI", "UPI", "UPI", "Cash", "Cash", "Card", "Card", "Wallet", "Others"];
const STAGES = ["Not Started", "Cutting", "Stitching", "Alteration", "Quality Check", "Packing"];

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86400000;
export const RANGE_END = "2026-09-14";
const END_TS = Date.parse(RANGE_END);
const TOTAL_DAYS = 60;

function iso(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

export function formatDay(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00Z");
  return `${d.getUTCDate()} ${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}`;
}

function buildOrders(): OrderRecord[] {
  const rnd = mulberry32(20260914);
  const out: OrderRecord[] = [];
  for (let d = TOTAL_DAYS - 1; d >= 0; d--) {
    const dayTs = END_TS - d * DAY;
    const perDay = 4 + Math.floor(rnd() * 7);
    for (let i = 0; i < perDay; i++) {
      const category = CATEGORIES[Math.floor(rnd() * CATEGORIES.length)];
      const products = PRODUCTS[category];
      const emp = employeeEfficiency[Math.floor(rnd() * employeeEfficiency.length)];
      const age = d;
      const r = rnd();
      let status: OrderStatus;
      if (age > 6) status = r < 0.88 ? "Completed" : r < 0.95 ? "Returned" : "In Progress";
      else status = r < 0.3 ? "Completed" : r < 0.78 ? "In Progress" : r < 0.94 ? "Not Started" : "Returned";
      const stage =
        status === "Completed"
          ? "Packed"
          : status === "Not Started"
          ? "Not Started"
          : STAGES[1 + Math.floor(rnd() * (STAGES.length - 1))];
      const payment: PaymentStatus =
        status === "Returned" ? "Refunded" : status === "Completed" ? "Paid" : rnd() < 0.55 ? "Paid" : "Pending";
      const base = [300, 450, 600, 900, 1200, 1800, 2400, 3200, 5400][Math.floor(rnd() * 9)];
      const leadDays = 1 + Math.floor(rnd() * 5);
      out.push({
        id: `OD${(1000 + out.length).toString()}`,
        cartId: `CART-${400 + Math.floor(out.length / 3)}`,
        customer: CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)],
        phone: `+91 9${Math.floor(100000000 + rnd() * 899999999)}`,
        product: products[Math.floor(rnd() * products.length)],
        category,
        employee: status === "Not Started" ? "Unassigned" : emp.name,
        role: status === "Not Started" ? "—" : emp.role,
        stage,
        status,
        payment,
        method: METHODS[Math.floor(rnd() * METHODS.length)],
        value: base,
        orderDate: iso(dayTs),
        deliveryDate: iso(dayTs + leadDays * DAY),
        hours: Math.round((0.5 + rnd() * 9) * 10) / 10,
      });
    }
  }
  return out;
}

export const orderRecords: OrderRecord[] = buildOrders();

export interface DateRange {
  from: string;
  to: string;
}

export const DEFAULT_RANGE: DateRange = { from: iso(END_TS - 13 * DAY), to: RANGE_END };

export const RANGE_PRESETS: { label: string; days: number }[] = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 60 days", days: 60 },
];

export function presetRange(days: number): DateRange {
  return { from: iso(END_TS - (days - 1) * DAY), to: RANGE_END };
}

export function ordersInRange(range: DateRange): OrderRecord[] {
  return orderRecords.filter((o) => o.orderDate >= range.from && o.orderDate <= range.to);
}

export function previousRange(range: DateRange): DateRange {
  const span = (Date.parse(range.to) - Date.parse(range.from)) / DAY + 1;
  return { from: iso(Date.parse(range.from) - span * DAY), to: iso(Date.parse(range.from) - DAY) };
}

const sum = (rows: OrderRecord[]) => rows.reduce((s, o) => s + o.value, 0);
const pctDelta = (now: number, prev: number) =>
  prev === 0 ? (now > 0 ? 100 : 0) : Math.round(((now - prev) / prev) * 100);

export function computeOverview(rows: OrderRecord[], prev: OrderRecord[]) {
  const by = (list: OrderRecord[], s: OrderStatus) => list.filter((o) => o.status === s);
  return {
    totalOrders: rows.length,
    revenue: sum(rows),
    completed: by(rows, "Completed").length,
    inProgress: by(rows, "In Progress").length,
    notStarted: by(rows, "Not Started").length,
    returns: by(rows, "Returned").length,
    deltas: {
      totalOrders: pctDelta(rows.length, prev.length),
      revenue: pctDelta(sum(rows), sum(prev)),
      completed: pctDelta(by(rows, "Completed").length, by(prev, "Completed").length),
      inProgress: pctDelta(by(rows, "In Progress").length, by(prev, "In Progress").length),
      notStarted: pctDelta(by(rows, "Not Started").length, by(prev, "Not Started").length),
      returns: pctDelta(by(rows, "Returned").length, by(prev, "Returned").length),
    },
  };
}

export function computeCategoryStats(rows: OrderRecord[]): CategoryStat[] {
  return CATEGORIES.map((category) => {
    const list = rows.filter((o) => o.category === category);
    return {
      category,
      completed: list.filter((o) => o.status === "Completed").length,
      returned: list.filter((o) => o.status === "Returned").length,
      notStarted: list.filter((o) => o.status === "Not Started").length,
      inProgress: list.filter((o) => o.status === "In Progress").length,
      revenue: sum(list),
    };
  }).filter((c) => c.completed + c.returned + c.notStarted + c.inProgress > 0);
}

export function computeDailyFlow(rows: OrderRecord[], range: DateRange) {
  const days: { date: string; iso: string; incomingCount: number; incomingValue: number; outgoingCount: number; outgoingValue: number }[] = [];
  for (let ts = Date.parse(range.from); ts <= Date.parse(range.to); ts += DAY) {
    const key = iso(ts);
    const incoming = rows.filter((o) => o.orderDate === key);
    const outgoing = rows.filter((o) => o.status === "Completed" && o.deliveryDate === key);
    days.push({
      date: formatDay(key),
      iso: key,
      incomingCount: incoming.length,
      incomingValue: sum(incoming),
      outgoingCount: outgoing.length,
      outgoingValue: sum(outgoing),
    });
  }
  return days;
}

export function computeFinance(rows: OrderRecord[]) {
  const paid = rows.filter((o) => o.payment === "Paid");
  const pending = rows.filter((o) => o.payment === "Pending");
  const refunded = rows.filter((o) => o.payment === "Refunded");
  const total = sum(rows);
  return {
    totalRevenue: total,
    completedValue: sum(paid),
    pendingValue: sum(pending),
    avgOrderValue: rows.length ? Math.round(total / rows.length) : 0,
    refunds: sum(refunded),
    netRevenue: total - sum(refunded),
  };
}

export function computePaymentMethods(rows: OrderRecord[]) {
  const names = ["UPI", "Cash", "Card", "Wallet", "Others"];
  return names.map((name) => ({
    name,
    value: rows.length ? Math.round((rows.filter((o) => o.method === name).length / rows.length) * 100) : 0,
  }));
}

export const VALUE_BUCKETS: { range: string; min: number; max: number }[] = [
  { range: "< ₹500", min: 0, max: 499 },
  { range: "₹500 - 1K", min: 500, max: 999 },
  { range: "₹1K - 2K", min: 1000, max: 1999 },
  { range: "₹2K - 5K", min: 2000, max: 4999 },
  { range: "> ₹5K", min: 5000, max: Infinity },
];

export function computeValueBuckets(rows: OrderRecord[]) {
  return VALUE_BUCKETS.map((b) => ({
    range: b.range,
    count: rows.filter((o) => o.value >= b.min && o.value <= b.max).length,
  }));
}

export function computeStages(rows: OrderRecord[]) {
  const open = rows.filter((o) => o.status !== "Completed" && o.status !== "Returned");
  return ["Not Started", "Cutting", "Stitching", "Quality Check", "Packing", "Alteration"]
    .map((stage) => {
      const count = open.filter((o) => o.stage === stage).length;
      return { stage, count, pct: open.length ? Math.round((count / open.length) * 100) : 0 };
    })
    .filter((s) => s.count > 0);
}

export function computeEmployeeStats(rows: OrderRecord[]) {
  return employeeEfficiency.map((e) => {
    const mine = rows.filter((o) => o.employee === e.name);
    const done = mine.filter((o) => o.status === "Completed");
    const active = mine.filter((o) => o.status === "In Progress");
    const avg = mine.length ? Math.round((mine.reduce((s, o) => s + o.hours, 0) / mine.length) * 10) / 10 : 0;
    return {
      ...e,
      assigned: mine.length,
      completed: done.length,
      avgHours: avg || e.avgHours,
      activeLoad: active.length,
      capacity: Math.max(e.capacity, active.length),
    };
  });
}

export function computeCategoryQueue(rows: OrderRecord[]): CategoryCompletion[] {
  return CATEGORIES.map((category) => {
    const list = rows.filter((o) => o.category === category);
    const queue = list.filter((o) => o.status === "In Progress" || o.status === "Not Started");
    const done = list.filter((o) => o.status === "Completed");
    const avgHours = done.length ? done.reduce((s, o) => s + o.hours, 0) / done.length : 0;
    return {
      category,
      avgDays: Math.round((avgHours / 8) * 10) / 10 || 1,
      targetDays: 2,
      inQueue: queue.length,
      estQueueHours: Math.round(queue.length * (avgHours || 4)),
    };
  }).filter((c) => c.inQueue > 0 || c.avgDays > 0);
}
