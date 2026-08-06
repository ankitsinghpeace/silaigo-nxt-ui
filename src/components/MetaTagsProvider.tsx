// components/MetaTagsProvider.tsx

"use client";

import Head from "next/head";

interface MetaTagsProviderProps {
  title: string;
  description: string;
  image?: string;
  canonicalPath?: string;
  type?: string;
  keywords?: string;
  noindex?: boolean;
}

const BASE_URL = "https://www.silaigo.com";
const defaultImage = `${BASE_URL}/logo.png`;

export const MetaTagsProvider = ({
  title,
  description,
  image,
  canonicalPath,
  type = "website",
  keywords,
  noindex = false,
}: MetaTagsProviderProps) => {
  const standardizedPath = canonicalPath
    ? canonicalPath.startsWith("/")
      ? canonicalPath
      : `/${canonicalPath}`
    : "";

  const cleanPath = standardizedPath.replace(/\/+$/, "") || "/";

  const canonicalUrl = `${BASE_URL}${cleanPath === "/" ? "" : cleanPath}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>

      <meta name="title" content={title} />

      <meta name="description" content={description} />

      {keywords && <meta name="keywords" content={keywords} />}

      <meta name="author" content="Silaigo | Ankit Singh" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />

      <meta property="og:url" content={canonicalUrl} />

      <meta property="og:title" content={title} />

      <meta property="og:description" content={description} />

      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />

      <meta name="twitter:title" content={title} />

      <meta name="twitter:description" content={description} />

      <meta name="twitter:image" content={image || defaultImage} />

      {/* Robots */}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      <link rel="canonical" href={canonicalUrl} />

      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

      <meta name="language" content="English" />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
};
