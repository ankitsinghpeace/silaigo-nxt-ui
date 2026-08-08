"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleConfigCard from "@/components/admin/ScheduleConfigCard";
import { Calendar } from "lucide-react";
import AvailabilitiesConfig from "@/components/admin/AvailabilitiesConfig";
import { useRouter } from "@/lib/next-router-compat";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const router = useRouter();
  const searchParams = router.query;
  const setSearchParams = (params) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...params,
      },
    });
  };
  useEffect(() => {
    const tab = router.query.tab;
    if (tab) {
      setActiveTab(tab);
    } else {
      setSearchParams({ tab: "schedule" });
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application settings and preferences
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="availabilities"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Appointment Availabilities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Schedule Settings</h2>
              <p className="text-muted-foreground mb-6">
                Configure appointment scheduling, working hours, and
                availability settings.
              </p>
              <ScheduleConfigCard />
            </div>
          </TabsContent>

          <TabsContent value="availabilities" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Appointment Availabilities
              </h2>
              <p className="text-muted-foreground mb-6">
                Configure appointment availabilities and availability settings.
              </p>
              <AvailabilitiesConfig />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
