// src/components/auth/ProtectedRoute.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissions = [],
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  const allowed =
    permissions.length === 0 ||
    permissions.some((permission) => hasPermission(permission));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!allowed) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, allowed, router]);

  if (isLoading || !isAuthenticated || !allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
