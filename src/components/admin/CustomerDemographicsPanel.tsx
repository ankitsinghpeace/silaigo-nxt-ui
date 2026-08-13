"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useCustomerOrderStats } from "@/hooks/useCustomerOrderStats";

const BUCKET_COLORS = ["#94a3b8", "hsl(var(--primary))", "#D4AF37"];

const CustomerDemographicsPanel: React.FC = () => {
  const { data: statsMap, isPending } = useCustomerOrderStats();

  const { buckets, leaders } = useMemo(() => {
    const entries = Object.entries(statsMap || {});
    let one = 0;
    let two = 0;
    let threePlus = 0;
    entries.forEach(([, s]) => {
      if (s.count >= 3) threePlus += 1;
      else if (s.count === 2) two += 1;
      else one += 1;
    });

    const leaders = entries
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      buckets: [
        { name: "1 order", value: one },
        { name: "2 orders", value: two },
        { name: "3+ orders (repeat)", value: threePlus },
      ],
      leaders,
    };
  }, [statsMap]);

  return (
    <div className="space-y-4" data-testid="customer-demographics-panel">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-gold" /> Customer Demographics
          </h2>
          <p className="text-sm text-muted-foreground">
            Who's ordering once vs. becoming a repeat customer — useful for follow-ups
            and loyalty offers.
          </p>
        </div>
        {isPending && (
          <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Aggregating orders…
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order frequency split</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={buckets}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {buckets.map((_, i) => (
                    <Cell key={i} fill={BUCKET_COLORS[i % BUCKET_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top repeat customers — follow up first</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Orders</th>
                  <th className="py-2 pr-4">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {leaders.filter((l) => l.count >= 2).map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{l.name || l.id}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        {l.count}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {l.lastOrderDate
                        ? new Date(l.lastOrderDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
                {!leaders.some((l) => l.count >= 2) && !isPending && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      No repeat customers in the sampled orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDemographicsPanel;
