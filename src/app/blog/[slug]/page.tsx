// src/app/blog/[slug]/page.tsx
"use client";

import { use } from "react";
import BlogPreviewPage from "@/page_components/BlogPreviewPage";

export const dynamic = 'force-dynamic';

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <BlogPreviewPage slug={slug} />;
}
