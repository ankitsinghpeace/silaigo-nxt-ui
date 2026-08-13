"use client";

import React, { useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Sparkles,
  Users,
  PhoneCall,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "@/services/modules/orders.api";
import { format, subDays, startOfMonth } from "date-fns";
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

const staticTiles = [
  {
    title: "Manage Orders",
    description: "Track and update customer orders.",
    icon: ShoppingBag,
    href: "/admin/orders",
  },
  {
    title: "Scheduled Calls",
    description: "View and follow up on customer queries.",
    icon: PhoneCall,
    href: "/admin/scheduled-phone-calls",
  },
  {
    title: "Categories & Content",
    description: "Edit landing pages, blogs & categories.",
    icon: Sparkles,
    href: "/admin/content/landing",
  },
  {
    title: "Customers",
    description: "Manage customer data and insights.",
    icon: Users,
    href: "/admin/customers",
  },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ef4444",
  "#14b8a6",
];

const orderAmount = (o: any) => Number(o?.customPrice || o?.productPrice || 0);

const isPaid = (o: any) =>
  String(o?.paymentStatus || "").toLowerCase().includes("paid") ||
  String(o?.paymentStatus || "").toLowerCase() === "payment_done" ||
  String(o?.orderStatus || "").toLowerCase() === "payment_done";

const AdminDashboard = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["admin-dashboard-orders"],
    queryFn: () =>
      getAllOrders(
        new URLSearchParams({ page: "1", limit: "100", sortBy: "newest" }).toString(),
      ),
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  const orders: any[] = data?.orders || [];

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + orderAmount(o), 0);
    const paidRevenue = orders
      .filter(isPaid)
      .reduce((s, o) => s + orderAmount(o), 0);
    const completed = orders.filter(
      (o) =>
        String(o.orderStatus || "").toLowerCase() === "completed" ||
        o.orderProcessingState === "ORDER_COMPLETE",
    ).length;
    const pending = orders.length - completed;
    const customers = new Set(
      orders.map((o) => o.customerPhone || o.customerEmail || o.customerName),
    ).size;
    const avg = orders.length ? Math.round(totalRevenue / orders.length) : 0;
    const monthStart = startOfMonth(new Date());
    const monthRevenue = orders
      .filter((o) => o.orderDate && new Date(o.orderDate) >= monthStart)
      .reduce((s, o) => s + orderAmount(o), 0);

    return {
      totalRevenue,
      paidRevenue,
      completed,
      pending,
      customers,
      avg,
      monthRevenue,
      count: orders.length,
    };
  }, [orders]);

  // Revenue / orders trend for the last 14 days
  const trend = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = subDays(new Date(), 13 - i);
      return { key: format(d, "yyyy-MM-dd"), label: format(d, "dd MMM"), revenue: 0, orders: 0 };
    });
    const map = new Map(days.map((d) => [d.key, d]));
    orders.forEach((o) => {
      if (!o.orderDate) return;
      const key = format(new Date(o.orderDate), "yyyy-MM-dd");
      const row = map.get(key);
      if (row) {
        row.revenue += orderAmount(o);
        row.orders += 1;
      }
    });
    return days;
  }, [orders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const k = String(o.orderStatus || "unknown").replace(/_/g, " ");
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      const name = o.productName || "Other";
      counts[name] = counts[name] || { name, revenue: 0, orders: 0 };
      counts[name].revenue += orderAmount(o);
      counts[name].orders += 1;
    });
    return Object.values(counts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders]);

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      sub: `₹${metrics.paidRevenue.toLocaleString()} collected`,
      icon: IndianRupee,
    },
    {
      label: "This Month",
      value: `₹${metrics.monthRevenue.toLocaleString()}`,
      sub: `Avg order ₹${metrics.avg.toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      label: "Orders",
      value: metrics.count.toLocaleString(),
      sub: `${metrics.customers} unique customers`,
      icon: ShoppingBag,
    },
    {
      label: "In Progress",
      value: metrics.pending.toLocaleString(),
      sub: `${metrics.completed} completed`,
      icon: Clock,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Business overview across your most recent {metrics.count} orders
            </p>
          </div>
          {isPending && (
            <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading metrics
            </span>
          )}
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Unable to load analytics right now.
          </div>
        ) : null}

        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label} className="hover-lift">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue — last 14 days</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v: any, n: any) =>
                      n === "revenue" ? [`₹${Number(v).toLocaleString()}`, "Revenue"] : [v, "Orders"]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Orders by status</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top products by revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ left: -10, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[280px] overflow-auto">
              {orders.slice(0, 8).map((o) => (
                <Link
                  key={o.id}
                  href="/admin/orders"
                  className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {o.customerName || "Customer"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.productName || o.orderId}
                    </p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    ₹{orderAmount(o).toLocaleString()}
                  </span>
                </Link>
              ))}
              {!orders.length && !isPending && (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {staticTiles.map((tile) => (
            <Link href={tile.href} key={tile.title}>
              <Card className="hover-lift cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {tile.title}
                  </CardTitle>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <tile.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {tile.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Daily checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Review scheduled calls before 11am daily.</li>
              <li>Keep categories & offers updated for smoother customer journeys.</li>
              <li>Keep communication clear with tailors about order expectations.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
