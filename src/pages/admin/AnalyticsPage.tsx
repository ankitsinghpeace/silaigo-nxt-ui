import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const AnalyticsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View performance metrics for your business
          </p>
        </div>

        <div className="p-6 border border-dashed rounded-lg text-center">
          <h2 className="text-lg font-medium mb-2">Analytics Coming Soon</h2>
          <p className="text-muted-foreground">
            This section is under development and will be available in a future
            update.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
