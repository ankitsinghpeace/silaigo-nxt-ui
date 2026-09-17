"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock,
  PauseCircle,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatTile from "./StatTile";
import DrillDownModal, { DrillDownState } from "./DrillDownModal";
import {
  DateRange,
  OrderRecord,
  ordersInRange,
  previousRange,
  computeOverview,
  computeCategoryStats,
  computeDailyFlow,
  formatDay,
} from "@/lib/adminSampleData";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#94a3b8"];

interface Props {
  range: DateRange;
}

const OverviewTab: React.FC<Props> = ({ range }) => {
  const [drill, setDrill] = useState<DrillDownState | null>(null);

  const rows = useMemo(() => ordersInRange(range), [range]);
  const prevRows = useMemo(() => ordersInRange(previousRange(range)), [range]);
  const kpis = useMemo(() => computeOverview(rows, prevRows), [rows, prevRows]);
  const categoryStats = useMemo(() => computeCategoryStats(rows), [rows]);
  const dailyFlow = useMemo(() => computeDailyFlow(rows, range), [rows, range]);

  const open = (title: string, description: string, list: OrderRecord[]) =>
    setDrill({ title, description, rows: list });

  const byStatus = (s: OrderRecord["status"]) => rows.filter((o) => o.status === s);

  const statusData = [
    { name: "Completed", value: kpis.completed },
    { name: "In Progress", value: kpis.inProgress },
    { name: "Not Started", value: kpis.notStarted },
    { name: "Returned", value: kpis.returns },
  ];
  const statusTotal = statusData.reduce((s, d) => s + d.value, 0) || 1;

  const categoryPie = categoryStats.map((c) => ({
    name: c.category,
    value: c.completed + c.inProgress + c.notStarted + c.returned,
  }));
  const categoryTotal = categoryPie.reduce((s, d) => s + d.value, 0) || 1;
  const maxRevenue = Math.max(1, ...categoryStats.map((c) => c.revenue));

  const openStatus = (name: string) =>
    open(`${name} orders`, `${formatDay(range.from)} – ${formatDay(range.to)}`, byStatus(name as OrderRecord["status"]));

  const openCategory = (category: string) =>
    open(
      `${category} orders`,
      `All orders in ${category} for the selected period`,
      rows.filter((o) => o.category === category),
    );

  const openDay = (isoDate: string, mode: "in" | "out") =>
    open(
      mode === "in" ? `Orders received on ${formatDay(isoDate)}` : `Orders delivered on ${formatDay(isoDate)}`,
      mode === "in" ? "Orders booked that day" : "Completed orders delivered that day",
      mode === "in"
        ? rows.filter((o) => o.orderDate === isoDate)
        : rows.filter((o) => o.status === "Completed" && o.deliveryDate === isoDate),
    );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        <StatTile label="Total Orders" value={kpis.totalOrders} delta={kpis.deltas.totalOrders} sub="vs previous period" icon={ShoppingBag} tone="sky" onClick={() => open("All orders", `${formatDay(range.from)} – ${formatDay(range.to)}`, rows)} />
        <StatTile label="Revenue" value={`₹${kpis.revenue.toLocaleString()}`} delta={kpis.deltas.revenue} sub="vs previous period" icon={IndianRupee} tone="emerald" onClick={() => open("Revenue — all orders", "Every order contributing to revenue", rows)} />
        <StatTile label="Completed" value={kpis.completed} delta={kpis.deltas.completed} sub="vs previous period" icon={CheckCircle2} tone="violet" onClick={() => openStatus("Completed")} />
        <StatTile label="In Progress" value={kpis.inProgress} delta={kpis.deltas.inProgress} sub="vs previous period" icon={Clock} tone="amber" onClick={() => openStatus("In Progress")} />
        <StatTile label="Not Started" value={kpis.notStarted} delta={kpis.deltas.notStarted} sub="vs previous period" icon={PauseCircle} tone="rose" invertDelta onClick={() => openStatus("Not Started")} />
        <StatTile label="Returns" value={kpis.returns} delta={kpis.deltas.returns} sub="vs previous period" icon={RotateCcw} tone="rose" invertDelta onClick={() => openStatus("Returned")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Daily Incoming vs Outgoing Orders</CardTitle>
            <p className="text-xs text-muted-foreground">Click any day to see that day&apos;s orders</p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyFlow}
                margin={{ left: -15, right: 8, top: 10 }}
                onClick={(e: any) => {
                  const point = e?.activePayload?.[0]?.payload;
                  if (point) openDay(point.iso, "in");
                }}
                style={{ cursor: "pointer" }}
              >
                <defs>
                  <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="incomingCount" name="Incoming Orders" stroke="#3b82f6" fill="url(#inGrad)" strokeWidth={2} activeDot={{ r: 5, onClick: (_: any, p: any) => openDay(p?.payload?.iso, "in") }} />
                <Area type="monotone" dataKey="outgoingCount" name="Completed Orders" stroke="#10b981" fill="url(#outGrad)" strokeWidth={2} activeDot={{ r: 5, onClick: (_: any, p: any) => openDay(p?.payload?.iso, "out") }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Order Status Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Click a slice for the order list</p>
          </CardHeader>
          <CardContent>
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    onClick={(d: any) => openStatus(d?.name)}
                    style={{ cursor: "pointer" }}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {statusData.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => openStatus(s.name)}
                  className="w-full flex items-center justify-between text-sm rounded px-1 py-0.5 hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {s.name}
                  </span>
                  <span className="text-muted-foreground">
                    {s.value} ({Math.round((s.value / statusTotal) * 100)}%)
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Orders by Category</CardTitle>
            <p className="text-xs text-muted-foreground">Click a category to drill down</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 items-center">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPie}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    onClick={(d: any) => openCategory(d?.name)}
                    style={{ cursor: "pointer" }}
                  >
                    {categoryPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {categoryPie.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => openCategory(c.name)}
                  className="w-full flex items-center justify-between text-sm rounded px-1 py-0.5 hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {c.value} ({Math.round((c.value / categoryTotal) * 100)}%)
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Revenue by Category</CardTitle>
            <p className="text-xs text-muted-foreground">Click a bar to see the orders behind it</p>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {categoryStats.map((c, i) => (
              <button
                key={c.category}
                onClick={() => openCategory(c.category)}
                className="w-full flex items-center gap-3 text-sm rounded px-1 py-0.5 hover:bg-muted/60"
              >
                <span className="w-28 shrink-0 truncate text-left text-muted-foreground">{c.category}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(c.revenue / maxRevenue) * 100}%`, background: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="w-20 text-right font-medium">₹{c.revenue.toLocaleString()}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-base">Category Health</CardTitle>
          <p className="text-xs text-muted-foreground">Click any number to open the matching order list</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Completed</th>
                <th className="py-2 pr-4">In Progress</th>
                <th className="py-2 pr-4">Not Started</th>
                <th className="py-2 pr-4">Returns</th>
                <th className="py-2 pr-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((c) => {
                const cell = (status: OrderRecord["status"], count: number, tone: string) => (
                  <td className="py-2 pr-4">
                    <button
                      className={`${tone} hover:underline`}
                      onClick={() =>
                        open(
                          `${c.category} · ${status}`,
                          "Orders matching this category and status",
                          rows.filter((o) => o.category === c.category && o.status === status),
                        )
                      }
                    >
                      {count}
                    </button>
                  </td>
                );
                return (
                  <tr key={c.category} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-2 pr-4 font-medium">
                      <button className="hover:underline" onClick={() => openCategory(c.category)}>
                        {c.category}
                      </button>
                    </td>
                    {cell("Completed", c.completed, "text-emerald-600")}
                    {cell("In Progress", c.inProgress, "text-sky-600")}
                    {cell("Not Started", c.notStarted, "text-amber-600")}
                    {cell("Returned", c.returned, "text-rose-600")}
                    <td className="py-2 pr-4 text-right font-medium">
                      <button className="hover:underline" onClick={() => openCategory(c.category)}>
                        ₹{c.revenue.toLocaleString()}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <DrillDownModal state={drill} onClose={() => setDrill(null)} />
    </div>
  );
};

export default OverviewTab;
