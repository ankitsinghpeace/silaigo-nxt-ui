"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Layers,
  Clock,
  CalendarCheck,
  Target,
  AlertTriangle,
  Zap,
  UserPlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import StatTile from "./StatTile";
import DrillDownModal, { DrillDownState } from "./DrillDownModal";
import { cn } from "@/lib/utils";
import {
  DateRange,
  OrderRecord,
  ordersInRange,
  computeEmployeeStats,
  computeCategoryQueue,
  computeStages,
  formatDay,
} from "@/lib/adminSampleData";

type GroupKey = "employee" | "stage" | "category";

const STAGE_TONE: Record<string, string> = {
  "Not Started": "bg-amber-100 text-amber-700",
  Cutting: "bg-sky-100 text-sky-700",
  Stitching: "bg-violet-100 text-violet-700",
  Alteration: "bg-rose-100 text-rose-700",
  "Quality Check": "bg-indigo-100 text-indigo-700",
  Packing: "bg-emerald-100 text-emerald-700",
  Packed: "bg-emerald-100 text-emerald-700",
};

interface Props {
  range: DateRange;
}

const OperationsTab: React.FC<Props> = ({ range }) => {
  const [groupBy, setGroupBy] = useState<GroupKey>("employee");
  const [assigning, setAssigning] = useState<OrderRecord | null>(null);
  const [assignee, setAssignee] = useState<string>("");
  const [drill, setDrill] = useState<DrillDownState | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const rows = useMemo(() => ordersInRange(range), [range]);
  const openOrders = useMemo(
    () => rows.filter((o) => o.status === "In Progress" || o.status === "Not Started"),
    [rows],
  );
  const employees = useMemo(() => computeEmployeeStats(rows), [rows]);
  const categoryQueue = useMemo(() => computeCategoryQueue(rows), [rows]);
  const stages = useMemo(() => computeStages(rows), [rows]);
  const period = `${formatDay(range.from)} – ${formatDay(range.to)}`;

  const open = (title: string, description: string, list: OrderRecord[]) =>
    setDrill({ title, description, rows: list });

  const delayed = rows.filter(
    (o) => o.status !== "Completed" && o.status !== "Returned" && o.deliveryDate < range.to,
  );
  const completed = rows.filter((o) => o.status === "Completed");
  const onTimePct = completed.length
    ? Math.round((completed.filter((o) => o.hours <= 8).length / completed.length) * 100)
    : 0;
  const queueHours = Math.round(openOrders.reduce((s, o) => s + o.hours, 0));
  const avgDays = completed.length
    ? Math.round((completed.reduce((s, o) => s + o.hours, 0) / completed.length / 8) * 10) / 10
    : 0;

  const visibleOrders = useMemo(
    () =>
      openOrders.filter(
        (o) =>
          (stageFilter === "all" || o.stage === stageFilter) &&
          (employeeFilter === "all" || o.employee === employeeFilter),
      ),
    [openOrders, stageFilter, employeeFilter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, OrderRecord[]>();
    visibleOrders.forEach((o) => {
      const key = groupBy === "employee" ? o.employee : groupBy === "stage" ? o.stage : o.category;
      map.set(key, [...(map.get(key) || []), o]);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [visibleOrders, groupBy]);

  const bottlenecks = stages;
  const maxBottleneck = Math.max(1, ...bottlenecks.map((b) => b.count));
  const selectedEmployee = employees.find((e) => e.id === assignee);
  const stageOptions = Array.from(new Set(openOrders.map((o) => o.stage))).sort();
  const employeeOptions = Array.from(new Set(openOrders.map((o) => o.employee))).sort();

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        <StatTile label="Orders in Queue" value={openOrders.length} sub="in production" icon={Layers} tone="sky" onClick={() => open("Orders in queue", period, openOrders)} />
        <StatTile label="Estimated Workload" value={`${queueHours} hrs`} sub="pending work" icon={Clock} tone="rose" onClick={() => open("Pending workload", "Open orders making up the queue hours", openOrders)} />
        <StatTile label="Avg. Completion" value={`${avgDays} days`} sub="completed orders" icon={CalendarCheck} tone="emerald" onClick={() => open("Completed orders", period, completed)} />
        <StatTile label="On-Time Completion" value={`${onTimePct}%`} sub="of completed orders" icon={Target} tone="amber" onClick={() => open("On-time completions", "Completed within target hours", completed.filter((o) => o.hours <= 8))} />
        <StatTile label="Delayed Orders" value={delayed.length} sub="past delivery date" icon={AlertTriangle} tone="rose" onClick={() => open("Delayed orders", "Open orders past their delivery date", delayed)} />
        <StatTile label="Unassigned" value={openOrders.filter((o) => o.employee === "Unassigned").length} sub="need an owner" icon={Zap} tone="violet" onClick={() => open("Unassigned orders", "Waiting to be allocated", openOrders.filter((o) => o.employee === "Unassigned"))} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Order Flow by Production Stage</CardTitle>
            <p className="text-xs text-muted-foreground">Click a stage to list its orders</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
              {stages.map((s, i) => (
                <React.Fragment key={s.stage}>
                  <button
                    onClick={() => open(`${s.stage} orders`, period, openOrders.filter((o) => o.stage === s.stage))}
                    className="flex-1 min-w-[110px] rounded-lg border bg-muted/40 p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted"
                  >
                    <p className="text-2xl font-bold">{s.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.stage}</p>
                    <p className="text-[11px] text-muted-foreground">({s.pct}%)</p>
                  </button>
                  {i < stages.length - 1 && <div className="self-center text-muted-foreground">→</div>}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Bottlenecks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {bottlenecks.map((b, i) => (
              <button
                key={b.stage}
                onClick={() => open(`${b.stage} orders`, period, openOrders.filter((o) => o.stage === b.stage))}
                className="w-full flex items-center gap-3 text-sm rounded px-1 py-0.5 hover:bg-muted/60"
              >
                <span className="w-24 shrink-0 text-left text-muted-foreground">{b.stage}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(b.count / maxBottleneck) * 100}%`,
                      background: ["#ef4444", "#f59e0b", "#fbbf24", "#3b82f6", "#10b981", "#8b5cf6"][i % 6],
                    }}
                  />
                </div>
                <span className="w-6 text-right font-medium">{b.count}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Employee Efficiency</CardTitle>
            <p className="text-xs text-muted-foreground">Click a row to see that teammate&apos;s orders</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Done</th>
                  <th className="py-2 pr-3">Avg</th>
                  <th className="py-2 pr-3">Target</th>
                  <th className="py-2 pr-3">On Time</th>
                  <th className="py-2 pr-3">Load</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() =>
                      open(`${e.name} — orders`, `${e.role} · ${period}`, rows.filter((o) => o.employee === e.name))
                    }
                    className="border-b last:border-0 cursor-pointer hover:bg-muted/40"
                  >
                    <td className="py-2 pr-3">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.role}</p>
                    </td>
                    <td className="py-2 pr-3">
                      {e.completed}/{e.assigned}
                    </td>
                    <td
                      className={cn(
                        "py-2 pr-3 font-medium",
                        e.avgHours <= e.targetHours ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {e.avgHours}h
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{e.targetHours}h</td>
                    <td className="py-2 pr-3">{e.onTimePct}%</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              e.activeLoad / e.capacity > 0.85 ? "bg-rose-500" : "bg-primary",
                            )}
                            style={{ width: `${Math.min((e.activeLoad / e.capacity) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {e.activeLoad}/{e.capacity}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Estimated Time by Category</CardTitle>
            <p className="text-xs text-muted-foreground">Click a bar or row to open the queue</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryQueue}
                  margin={{ left: -15, right: 8, top: 8 }}
                  style={{ cursor: "pointer" }}
                  onClick={(e: any) => {
                    const p = e?.activePayload?.[0]?.payload;
                    if (p)
                      open(
                        `${p.category} queue`,
                        "Orders waiting in this category",
                        openOrders.filter((o) => o.category === p.category),
                      );
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="category" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-12} height={40} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: any) => [`${v} hrs`, "Queue time"]} />
                  <Bar dataKey="estQueueHours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-3">
              {categoryQueue.map((c) => (
                <button
                  key={c.category}
                  onClick={() =>
                    open(`${c.category} queue`, "Orders waiting in this category", openOrders.filter((o) => o.category === c.category))
                  }
                  className="w-full flex items-center justify-between text-sm rounded px-1 py-0.5 hover:bg-muted/60"
                >
                  <span className="truncate">{c.category}</span>
                  <span className="text-muted-foreground text-xs">
                    {c.avgDays}d avg · target {c.targetDays}d · {c.inQueue} in queue
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between gap-3 space-y-0 flex-wrap">
          <div>
            <CardTitle className="text-base">Active Orders</CardTitle>
            <p className="text-xs text-muted-foreground">
              {visibleOrders.length} of {openOrders.length} orders currently in production
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {stageOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Employee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {employeeOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupKey)}>
              <SelectTrigger className="w-[190px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Group by Employee</SelectItem>
                <SelectItem value="stage">Group by Action / Stage</SelectItem>
                <SelectItem value="category">Group by Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {grouped.map(([key, groupRows]) => (
            <div key={key} className="rounded-lg border overflow-hidden">
              <button
                onClick={() => open(`${key} — active orders`, period, groupRows)}
                className="w-full flex items-center justify-between bg-muted/50 px-4 py-2 hover:bg-muted"
              >
                <p className="font-medium text-sm">{key}</p>
                <p className="text-xs text-muted-foreground">
                  {groupRows.length} orders · ₹{groupRows.reduce((s, r) => s + r.value, 0).toLocaleString()}
                </p>
              </button>
              <div className="divide-y">
                {groupRows.slice(0, 6).map((o) => (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-2.5 text-sm flex-wrap">
                    <span className="font-medium w-24">{o.id}</span>
                    <span className="w-40 truncate">{o.product}</span>
                    <span className="w-32 truncate text-muted-foreground">{o.customer}</span>
                    <Badge className={cn("border-0", STAGE_TONE[o.stage] || "bg-muted text-foreground")}>
                      {o.stage}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Due {formatDay(o.deliveryDate)}</span>
                    <span className="ml-auto font-medium">₹{o.value}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => {
                        setAssigning(o);
                        setAssignee("");
                      }}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
                    </Button>
                  </div>
                ))}
                {groupRows.length > 6 && (
                  <button
                    onClick={() => open(`${key} — active orders`, period, groupRows)}
                    className="w-full px-4 py-2 text-xs text-primary hover:bg-muted/50"
                  >
                    View all {groupRows.length} orders
                  </button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!assigning} onOpenChange={(o) => !o && setAssigning(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Assign {assigning?.product} ({assigning?.id})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current workload is shown for each teammate so you don&apos;t overload them.
            </p>
            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {employees.map((e) => {
                const pct = Math.round((e.activeLoad / e.capacity) * 100);
                const busy = pct > 85;
                return (
                  <button
                    key={e.id}
                    onClick={() => setAssignee(e.id)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-colors",
                      assignee === e.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.role}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-semibold", busy ? "text-rose-600" : "text-emerald-600")}>
                          {e.activeLoad}/{e.capacity} orders
                        </p>
                        <p className="text-xs text-muted-foreground">{e.avgHours}h avg · {e.onTimePct}% on time</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", busy ? "bg-rose-500" : "bg-primary")}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            <Button className="w-full" disabled={!assignee} onClick={() => setAssigning(null)}>
              Assign to {selectedEmployee?.name || "teammate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DrillDownModal state={drill} onClose={() => setDrill(null)} />
    </div>
  );
};

export default OperationsTab;
