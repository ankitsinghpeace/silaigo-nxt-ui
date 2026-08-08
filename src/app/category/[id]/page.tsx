"use client";

import { use } from "react";
import CategoryPage from "@/page_components/CategoryPage";

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CategoryPage id={id} />;
}
