// app/order/[id]/page.tsx
import OrderDetailsPage from "@/pages/OrderDetailsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return <OrderDetailsPage />;
}
