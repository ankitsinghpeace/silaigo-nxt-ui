"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Factory, Wallet, Plus } from "lucide-react";
import OverviewTab from "@/components/admin/dashboard/OverviewTab";
import OperationsTab from "@/components/admin/dashboard/OperationsTab";
import FinanceTab from "@/components/admin/dashboard/FinanceTab";
import DateRangeFilter from "@/components/admin/dashboard/DateRangeFilter";
import { DEFAULT_RANGE, DateRange } from "@/lib/adminSampleData";

const AdminDashboard = () => {
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Good Morning, Admin! 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/create-order">
              <Plus className="h-4 w-4 mr-1" /> New Order
            </Link>
          </Button>
        </div>

        <DateRangeFilter range={range} onChange={setRange} />

        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Showing sample data — these panels are wired to placeholder numbers until
          the analytics endpoints go live. Click any metric, chart or row to open the
          detailed order list.
        </div>

        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <Factory className="h-4 w-4" /> Operations
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2">
              <Wallet className="h-4 w-4" /> Finance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab range={range} />
          </TabsContent>
          <TabsContent value="operations">
            <OperationsTab range={range} />
          </TabsContent>
          <TabsContent value="finance">
            <FinanceTab range={range} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
