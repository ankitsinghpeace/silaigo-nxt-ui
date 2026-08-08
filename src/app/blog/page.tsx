// src/app/blog/page.tsx
"use client";

import BlogPage from "@/page_components/BlogPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return <BlogPage />;
}