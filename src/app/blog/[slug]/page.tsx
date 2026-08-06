// src/app/blog/[slug]/page.tsx
import BlogPreviewPage from "@/pages/BlogPreviewPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPreviewPage slug={slug} />;
}
