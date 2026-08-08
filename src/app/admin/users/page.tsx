// src/app/admin/users/page.tsx
"use client";

import UserManagementPage from "@/page_components/admin/UserManagementPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return <UserManagementPage />;
}