"use client";

import React, { useState } from "react";
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
import { DateRange } from "@/lib/adminSampleData";
import { useFinance } from "@/hooks/useAnalytics";
import { getOrders } from "@/services/analytics.api";
import { formatDay } from "@/lib/adminSampleData";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#94a3b8", "#ef4444"];

interface Props {
  range: DateRange;
}

const FinanceTab: React.FC<Props> = ({ range }) => {
  const [drill, setDrill] = useState<DrillDownState | null>(null);
  const { data, loading, error } = useFinance(range);

  const open = async (title: string, description: string, filters: any) => {
    try {
      const ordersData = await getOrders({
        ...range,
        ...filters,
        page: 1,
        limit: 1000,
      });
      setDrill({ title, description, rows: ordersData.orders });
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading finance data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Failed to load finance data</div>
      </div>
    );
  }

  const { kpis, dailyFlow, categoryRevenue, paymentMethods, orderValueBuckets } = data;

  const totalCategoryRevenue = categoryRevenue.reduce((s, c) => s + c.revenue, 0) || 1;
  const period = `${formatDay(range.from)} – ${formatDay(range.to)}`;

  const openPayment = (payment: string, label: string) =>
    open(label, period, { payment });

  const openCategory = (category: string) =>
    open(`${category} revenue`, "Orders contributing to this category's revenue", { category });

  const openBucket = (rangeLabel: string) => {
    const minMax: Record<string, { min: number; max: number }> = {
      "< ₹500": { min: 0, max: 499 },
      "₹500 - 1K": { min: 500, max: 999 },
      "₹1K - 2K": { min: 1000, max: 1999 },
      "₹2K - 5K": { min: 2000, max: 4999 },
      "> ₹5K": { min: 5000, max: Infinity },
    };
    const b = minMax[rangeLabel];
    if (!b) return;
    // Note: API doesn't support value range filter yet, this would need to be added
    open(`Orders ${rangeLabel}`, "Orders in this value range", {});
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        <StatTile label="Total Revenue" value={`₹${kpis.totalRevenue.toLocaleString()}`} sub={period} icon={IndianRupee} tone="emerald" onClick={() => open("All orders — revenue", period, {})} />
        <StatTile label="Collected" value={`₹${kpis.completedValue.toLocaleString()}`} sub="paid orders" icon={CheckCircle2} tone="sky" onClick={() => openPayment("Paid", "Paid orders")} />
        <StatTile label="Pending Value" value={`₹${kpis.pendingValue.toLocaleString()}`} sub="to be collected" icon={Clock} tone="amber" onClick={() => openPayment("Pending", "Payment pending orders")} />
        <StatTile label="Avg Order Value" value={`₹${kpis.avgOrderValue.toLocaleString()}`} sub="orders" icon={Wallet} tone="violet" onClick={() => open("All orders by value", period, {})} />
        <StatTile label="Returns / Refunds" value={`₹${kpis.refunds.toLocaleString()}`} sub="refunded" icon={RotateCcw} tone="rose" onClick={() => openPayment("Refunded", "Refunded orders")} />
        <StatTile label="Net Revenue" value={`₹${kpis.netRevenue.toLocaleString()}`} sub="after refunds" icon={TrendingUp} tone="emerald" onClick={() => open("Net revenue orders", "All orders excluding refunds", { payment: "Paid" })} />
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
                      { search: p.iso },
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
                    data={categoryRevenue}
                    dataKey="revenue"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    style={{ cursor: "pointer" }}
                    onClick={(d: any) => openCategory(d?.category ?? d?.name)}
                  >
                    {categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {categoryRevenue.map((c, i) => (
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
                      open(`${d?.name} payments`, period, { payment: d?.name === "Others" ? "Pending" : d?.name })
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
                  onClick={() => open(`${p.name} payments`, period, { payment: p.name === "Others" ? "Pending" : p.name })}
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
                text: `₹${kpis.pendingValue.toLocaleString()} is still pending collection.`,
                title: "Payment pending orders",
                filters: { payment: "Pending" },
              },
              {
                tone: "text-rose-600",
                text: `Some orders were returned in this period.`,
                title: "Returned orders",
                filters: { payment: "Refunded" },
              },
              {
                tone: "text-emerald-600",
                text: `Average order value is ₹${kpis.avgOrderValue.toLocaleString()}.`,
                title: "All orders",
                filters: {},
              },
              {
                tone: "text-sky-600",
                text: `${categoryRevenue[0]?.category ?? "Top category"} contributes ₹${(categoryRevenue[0]?.revenue ?? 0).toLocaleString()}.`,
                filters: { category: categoryRevenue[0]?.category },
                title: `${categoryRevenue[0]?.category ?? "Top category"} orders`,
              },
            ].map((i) => (
              <button
                key={i.text}
                onClick={() => open(i.title, period, i.filters)}
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
