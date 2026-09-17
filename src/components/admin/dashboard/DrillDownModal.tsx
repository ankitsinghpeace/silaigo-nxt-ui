"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderRecord, formatDay } from "@/lib/adminSampleData";

const STATUS_TONE: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-sky-100 text-sky-700",
  "Not Started": "bg-amber-100 text-amber-700",
  Returned: "bg-rose-100 text-rose-700",
};

const PAY_TONE: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Refunded: "bg-rose-100 text-rose-700",
};

const uniq = (rows: OrderRecord[], key: keyof OrderRecord) =>
  Array.from(new Set(rows.map((r) => String(r[key])))).sort();

export interface DrillDownState {
  title: string;
  description?: string;
  rows: OrderRecord[];
}

interface Props {
  state: DrillDownState | null;
  onClose: () => void;
}

const DrillDownModal: React.FC<Props> = ({ state, onClose }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [payment, setPayment] = useState("all");
  const [sort, setSort] = useState("date-desc");

  const rows = state?.rows ?? [];

  const reset = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setEmployee("all");
    setPayment("all");
    setSort("date-desc");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = rows.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (category === "all" || o.category === category) &&
        (employee === "all" || o.employee === employee) &&
        (payment === "all" || o.payment === payment) &&
        (!q ||
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q) ||
          o.phone.includes(q)),
    );
    const sorted = [...out];
    if (sort === "date-desc") sorted.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
    if (sort === "date-asc") sorted.sort((a, b) => a.orderDate.localeCompare(b.orderDate));
    if (sort === "value-desc") sorted.sort((a, b) => b.value - a.value);
    if (sort === "value-asc") sorted.sort((a, b) => a.value - b.value);
    if (sort === "delivery") sorted.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
    return sorted;
  }, [rows, search, status, category, employee, payment, sort]);

  const total = filtered.reduce((s, o) => s + o.value, 0);

  return (
    <Dialog
      open={!!state}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-6xl max-h-[88vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="text-lg">{state?.title}</DialogTitle>
          {state?.description && (
            <p className="text-xs text-muted-foreground">{state.description}</p>
          )}
        </DialogHeader>

        <div className="px-6 py-3 border-b flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, customer, product or phone"
              className="pl-8 h-9"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {uniq(rows, "status").map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[145px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {uniq(rows, "category").map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={employee} onValueChange={setEmployee}>
            <SelectTrigger className="h-9 w-[155px]"><SelectValue placeholder="Employee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {uniq(rows, "employee").map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={payment} onValueChange={setPayment}>
            <SelectTrigger className="h-9 w-[135px]"><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              {uniq(rows, "payment").map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="value-desc">Highest value</SelectItem>
              <SelectItem value="value-asc">Lowest value</SelectItem>
              <SelectItem value="delivery">Delivery date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto px-6 py-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders match these filters.</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[860px]">
              <thead className="sticky top-0 bg-background">
                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Assigned</th>
                  <th className="py-2 pr-3">Stage</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Payment</th>
                  <th className="py-2 pr-3">Ordered</th>
                  <th className="py-2 pr-3">Delivery</th>
                  <th className="py-2 pr-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-2 pr-3 font-medium">{o.id}</td>
                    <td className="py-2 pr-3">
                      <p className="truncate max-w-[130px]">{o.customer}</p>
                      <p className="text-[11px] text-muted-foreground">{o.phone}</p>
                    </td>
                    <td className="py-2 pr-3 truncate max-w-[140px]">{o.product}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{o.category}</td>
                    <td className="py-2 pr-3">
                      <p className="truncate max-w-[120px]">{o.employee}</p>
                      <p className="text-[11px] text-muted-foreground">{o.role}</p>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{o.stage}</td>
                    <td className="py-2 pr-3">
                      <Badge className={cn("border-0", STATUS_TONE[o.status])}>{o.status}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge className={cn("border-0", PAY_TONE[o.payment])}>
                        {o.payment} · {o.method}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{formatDay(o.orderDate)}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{formatDay(o.deliveryDate)}</td>
                    <td className="py-2 pr-3 text-right font-medium">₹{o.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {filtered.length} of {rows.length} orders
          </span>
          <span className="font-semibold">Total ₹{total.toLocaleString()}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownModal;
