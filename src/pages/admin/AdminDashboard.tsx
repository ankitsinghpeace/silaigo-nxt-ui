import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Sparkles,
  Users,
  PhoneCall,
  Layers,
  Quote,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services";

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

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
        </div>

        {/* Quote */}
        <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-2 text-muted-foreground">
          <Quote className="h-4 w-4 mt-1 text-primary" />
          <p className="text-sm italic">
            "Great systems build great businesses. Stay consistent and support
            your tailors well."
          </p>
        </div>

        {/* Static Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {staticTiles.map((tile) => (
            <Link href={tile.href} key={tile.title}>
              <Card className="hover-lift animate-fade-in cursor-pointer">
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

        {/* Optional: Add any business reminders */}
        <Card className="col-span-full hover-lift animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Review scheduled calls before 11am daily.</li>
              <li>
                Keep categories & offers updated for smoother customer journeys.
              </li>
              <li>
                Keep communication clear with tailors about order expectations.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
