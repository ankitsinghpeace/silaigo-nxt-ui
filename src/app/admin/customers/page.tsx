// src/app/admin/customers/page.tsx
"use client";

import CustomersPage from "@/page_components/admin/CustomersPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return <CustomersPage />;
}