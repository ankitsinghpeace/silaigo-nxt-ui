"use client";

import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderFlowProvider } from "@/contexts/OrderFlowContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={null}>
          <AuthProvider>
            <OrderFlowProvider>
              {children}
            </OrderFlowProvider>

            <Toaster />
            <Sonner />
          </AuthProvider>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
