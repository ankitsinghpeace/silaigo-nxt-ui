"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/auth.api";
import { Button } from "@/components/ui/button";

/** Maps an admin route to the sections that grant access to it. */
const ROUTE_SECTIONS: Record<string, string[]> = {
  "/admin/dashboard": ["dashboard", "orders", "content", "customers", "settings"],
  "/admin/analytics": ["analytics"],
  "/admin/orders": ["orders"],
  "/admin/orders/pickups": ["orders"],
  "/admin/create-order": ["orders"],
  "/admin/measurements": ["settings", "orders"],
  "/admin/content/landing": ["content"],
  "/admin/content/category": ["inventory"],
  "/admin/content/blog": ["content"],
  "/admin/coupons": ["content"],
  "/admin/customers": ["customers", "orders"],
  "/admin/scheduled-phone-calls": ["customers"],
  "/admin/users": ["users"],
  "/admin/settings": ["settings", "appointments"],
  "/admin/change-password": ["change-password", "settings"],
};

const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

const FullScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-50 to-blue-50 px-6 text-center">
    {children}
  </div>
);

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { isAuthenticated, isLoading, user, accessibleSections } = useAuth();

  const isPublic = PUBLIC_ADMIN_ROUTES.some((p) => pathname.startsWith(p));
  const isCustomer = user?.role === UserRole.CUSTOMER;

  const allowed = useMemo(() => {
    if (!isAuthenticated || isCustomer) return false;
    const required = ROUTE_SECTIONS[pathname];
    if (!required) return true; // unmapped admin route: authentication is enough
    const sections = accessibleSections();
    return required.some((s) => sections.includes(s));
  }, [isAuthenticated, isCustomer, pathname, accessibleSections]);

  useEffect(() => {
    if (isPublic || isLoading) return;
    if (!isAuthenticated) {
      router.replace(
        `/admin/login?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`,
      );
    } else if (isCustomer) {
      router.replace("/profile");
    }
  }, [isPublic, isLoading, isAuthenticated, isCustomer, pathname, router]);

  if (isPublic) return <>{children}</>;

  if (isLoading || !isAuthenticated || isCustomer) {
    return (
      <FullScreen>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isLoading ? "Verifying your session…" : "Redirecting…"}
        </p>
      </FullScreen>
    );
  }

  if (!allowed) {
    return (
      <FullScreen>
        <ShieldAlert className="h-10 w-10 text-red-500" />
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="text-muted-foreground max-w-md">
          Your role ({user?.role}) does not have permission to view this section.
        </p>
        <Button onClick={() => router.replace("/admin/dashboard")}>
          Go to dashboard
        </Button>
      </FullScreen>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
