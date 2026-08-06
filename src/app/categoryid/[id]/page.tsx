// src/app/categoryid/[id]/page.tsx
import CategoryById from "@/pages/CategoryById";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <CategoryById />;
}
