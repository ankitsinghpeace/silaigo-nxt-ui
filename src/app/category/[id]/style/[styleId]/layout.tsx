"use client";

import { OrderFlowProvider } from "@/contexts/OrderFlowContext";

export default function StyleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrderFlowProvider>{children}</OrderFlowProvider>;
}
