"use client";

import { use } from "react";
import CategoryPage from "@/pages/CategoryPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CategoryPage id={id} />;
}
