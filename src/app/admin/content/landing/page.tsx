// src/app/admin/content/landing/page.tsx
"use client";

import LandingEditor from "@/page_components/admin/editor/LandingPageEditor";

export const dynamic = 'force-dynamic';

export default function Page() {
  return <LandingEditor />;
}