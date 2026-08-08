// src/app/categoryid/[id]/page.tsx
"use client";

import { use } from "react";
import CategoryById from "@/page_components/CategoryById";

export const dynamic = 'force-dynamic';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CategoryById />;
}
