// app/order/[id]/page.tsx
"use client";

import { use } from "react";
import OrderDetailsPage from "@/page_components/OrderDetailsPage";

export const dynamic = 'force-dynamic';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <OrderDetailsPage />;
}
