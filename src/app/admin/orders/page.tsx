// src/app/admin/orders/page.tsx
"use client";

import OrdersPage from "@/page_components/admin/OrdersPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return <OrdersPage />;
}