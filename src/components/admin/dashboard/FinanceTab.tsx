"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  Wallet,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import StatTile from "./StatTile";
import DrillDownModal, { DrillDownState } from "./DrillDownModal";
import {
  DateRange,
  OrderRecord,
  ordersInRange,
  computeFinance,
  computeCategoryStats,
  computeDailyFlow,
  computePaymentMethods,
  computeValueBuckets,
  VALUE_BUCKETS,
  formatDay,
} from "@/lib/adminSampleData";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#94a3b8", "#ef4444"];

interface Props {
  range: DateRange;
}

const FinanceTab: React.FC<Props> = ({ range }) => {
  const [drill, setDrill] = useState<DrillDownState | null>(null);

  const rows = useMemo(() => ordersInRange(range), [range]);
  const finance = useMemo(() => computeFinance(rows), [rows]);
  const categoryStats = useMemo(() => computeCategoryStats(rows), [rows]);
  const dailyFlow = useMemo(() => computeDailyFlow(rows, range), [rows, range]);
  const paymentMethods = useMemo(() => computePaymentMethods(rows), [rows]);
  const orderValueBuckets = useMemo(() => computeValueBuckets(rows), [rows]);

  const open = (title: string, description: string, list: OrderRecord[]) =>
    setDrill({ title, description, rows: list });

  const totalCategoryRevenue = categoryStats.reduce((s, c) => s + c.revenue, 0) || 1;
  const period = `${formatDay(range.from)} – ${formatDay(range.to)}`;

  const openPayment = (payment: OrderRecord["payment"], label: string) =>
    open(label, period, rows.filter((o) => o.payment === payment));

  const openCategory = (category: string) =>
    open(`${category} revenue`, "Orders contributing to this category's revenue", rows.filter((o) => o.category === category));

  const openBucket = (rangeLabel: string) => {
    const b = VALUE_BUCKETS.find((x) => x.range === rangeLabel);
    if (!b) return;
    open(`Orders ${rangeLabel}`, "Orders in this value range", rows.filter((o) => o.value >= b.min && o.value <= b.max));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        <StatTile label="Total Revenue" value={`₹${finance.totalRevenue.toLocaleString()}`} sub={period} icon={IndianRupee} tone="emerald" onClick={() => open("All orders — revenue", period, rows)} />
        <StatTile label="Collected" value={`₹${finance.completedValue.toLocaleString()}`} sub="paid orders" icon={CheckCircle2} tone="sky" onClick={() => openPayment("Paid", "Paid orders")} />
        <StatTile label="Pending Value" value={`₹${finance.pendingValue.toLocaleString()}`} sub="to be collected" icon={Clock} tone="amber" onClick={() => openPayment("Pending", "Payment pending orders")} />
        <StatTile label="Avg Order Value" value={`₹${finance.avgOrderValue.toLocaleString()}`} sub={`${rows.length} orders`} icon={Wallet} tone="violet" onClick={() => open("All orders by value", period, rows)} />
        <StatTile label="Returns / Refunds" value={`₹${finance.refunds.toLocaleString()}`} sub="refunded" icon={RotateCcw} tone="rose" onClick={() => openPayment("Refunded", "Refunded orders")} />
        <StatTile label="Net Revenue" value={`₹${finance.netRevenue.toLocaleString()}`} sub="after refunds" icon={TrendingUp} tone="emerald" onClick={() => open("Net revenue orders", "All orders excluding refunds", rows.filter((o) => o.payment !== "Refunded"))} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <p className="text-xs text-muted-foreground">
              Daily booked vs delivered order value — click a day for its orders
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyFlow}
                margin={{ left: -5, right: 8, top: 10 }}
                style={{ cursor: "pointer" }}
                onClick={(e: any) => {
                  const p = e?.activePayload?.[0]?.payload;
                  if (p)
                    open(
                      `Orders booked on ${p.date}`,
                      `₹${p.incomingValue.toLocaleString()} booked`,
                      rows.filter((o) => o.orderDate === p.iso),
                    );
                }}
              >
                <defs>
                  <linearGradient id="revIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(Number(v) / 1000)}K`} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="incomingValue" name="Booked" stroke="#3b82f6" fill="url(#revIn)" strokeWidth={2} />
                <Area type="monotone" dataKey="outgoingValue" name="Delivered" stroke="#10b981" fill="url(#revOut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Revenue by Category</CardTitle>
            <p className="text-xs text-muted-foreground">Click to drill down</p>
          </CardHeader>
          <CardContent>
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    dataKey="revenue"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    style={{ cursor: "pointer" }}
                    onClick={(d: any) => openCategory(d?.category ?? d?.name)}
                  >
                    {categoryStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {categoryStats.map((c, i) => (
                <button
                  key={c.category}
                  onClick={() => openCategory(c.category)}
                  className="w-full flex items-center justify-between text-sm rounded px-1 py-0.5 hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate">{c.category}</span>
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    ₹{c.revenue.toLocaleString()} · {Math.round((c.revenue / totalCategoryRevenue) * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Order Value Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Click a bar for those orders</p>
          </CardHeader>
          <CardContent className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderValueBuckets}
                margin={{ left: -20, right: 8, top: 10 }}
                style={{ cursor: "pointer" }}
                onClick={(e: any) => {
                  const p = e?.activePayload?.[0]?.payload;
                  if (p) openBucket(p.range);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="range" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} onClick={(d: any) => openBucket(d?.range)}>
                  {orderValueBuckets.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Payment Methods</CardTitle>
            <p className="text-xs text-muted-foreground">Click to list orders paid that way</p>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    style={{ cursor: "pointer" }}
                    onClick={(d: any) =>
                      open(`${d?.name} payments`, period, rows.filter((o) => o.method === d?.name))
                    }
                  >
                    {paymentMethods.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {paymentMethods.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => open(`${p.name} payments`, period, rows.filter((o) => o.method === p.name))}
                  className="w-full flex items-center justify-between text-sm rounded px-1 py-0.5 hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {p.name}
                  </span>
                  <span className="text-muted-foreground">{p.value}%</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3 text-sm">
            {[
              {
                tone: "text-amber-600",
                text: `₹${finance.pendingValue.toLocaleString()} is still pending collection.`,
                rows: rows.filter((o) => o.payment === "Pending"),
                title: "Payment pending orders",
              },
              {
                tone: "text-rose-600",
                text: `${rows.filter((o) => o.status === "Returned").length} orders were returned in this period.`,
                rows: rows.filter((o) => o.status === "Returned"),
                title: "Returned orders",
              },
              {
                tone: "text-emerald-600",
                text: `Average order value is ₹${finance.avgOrderValue.toLocaleString()}.`,
                rows,
                title: "All orders",
              },
              {
                tone: "text-sky-600",
                text: `${categoryStats[0]?.category ?? "Top category"} contributes ₹${(categoryStats[0]?.revenue ?? 0).toLocaleString()}.`,
                rows: rows.filter((o) => o.category === categoryStats[0]?.category),
                title: `${categoryStats[0]?.category ?? "Top category"} orders`,
              },
            ].map((i) => (
              <button
                key={i.text}
                onClick={() => open(i.title, period, i.rows)}
                className="flex gap-2 text-left w-full rounded px-1 py-0.5 hover:bg-muted/60"
              >
                <span className={i.tone}>●</span>
                <span className="text-muted-foreground">{i.text}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <DrillDownModal state={drill} onClose={() => setDrill(null)} />
    </div>
  );
};

export default FinanceTab;
