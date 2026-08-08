// src/app/admin/measurements/page.tsx
"use client";

import MeasurementCategory from "@/page_components/admin/MeasurementCategory";

export const dynamic = 'force-dynamic';

export default function Page() {
  return <MeasurementCategory />;
}