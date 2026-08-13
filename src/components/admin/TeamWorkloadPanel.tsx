"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTeamWorkloadStats } from "@/hooks/useTeamWorkloadStats";

interface TeamWorkloadPanelProps {
  orderIds: string[];
}

const TeamWorkloadPanel: React.FC<TeamWorkloadPanelProps> = ({ orderIds }) => {
  const { data: workload, isPending } = useTeamWorkloadStats(orderIds);

  const chartData = (workload || []).map((u) => ({
    name: u.user.length > 14 ? `${u.user.slice(0, 14)}…` : u.user,
    hours: Math.round(u.totalHours * 10) / 10,
    actions: u.actions,
  }));

  return (
    <div className="space-y-4" data-testid="team-workload-panel">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users2 className="h-4 w-4 text-primary" /> Team Workload
          </h2>
          <p className="text-sm text-muted-foreground">
            Time each teammate has spent moving orders between stages, sampled from the
            last {orderIds.length} orders (derived from each order&apos;s status timeline).
          </p>
        </div>
        {isPending && (
          <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Crunching timelines…
          </span>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Hours spent per teammate</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          {chartData.length === 0 && !isPending ? (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                No workload data available — your backend doesn't record a
                status-change timeline (<code>timeLine</code>) on orders yet.
              </p>
              <p>
                Once orders include a <code>timeLine: [{"{"}status, timeStamp, updatedBy{"}"}]</code>{" "}
                array (see BACKEND_CHANGES_NEEDED.md), this view will populate automatically —
                no frontend changes needed.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: any, n: any) =>
                    n === "hours" ? [`${v}h`, "Total hours"] : [v, "Actions"]
                  }
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Breakdown by teammate</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                <th className="py-2 pr-4">Teammate</th>
                <th className="py-2 pr-4">Actions</th>
                <th className="py-2 pr-4">Total Time</th>
                <th className="py-2 pr-4">Avg. per Action</th>
              </tr>
            </thead>
            <tbody>
              {(workload || []).map((u) => (
                <tr key={u.user} className="border-b last:border-0" data-testid={`workload-row-${u.user}`}>
                  <td className="py-2 pr-4 font-medium">{u.user}</td>
                  <td className="py-2 pr-4">{u.actions}</td>
                  <td className="py-2 pr-4">{u.totalHours.toFixed(1)}h</td>
                  <td className="py-2 pr-4">{u.avgHours.toFixed(1)}h</td>
                </tr>
              ))}
              {!workload?.length && !isPending && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
                    No workload data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamWorkloadPanel;
