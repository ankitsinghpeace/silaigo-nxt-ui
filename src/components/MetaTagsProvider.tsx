// components/MetaTagsProvider.tsx

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
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

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

  const canonicalUrl = cleanPath === "/" ? BASE_URL : `${BASE_URL}${cleanPath}`;

  const imageUrl = image || DEFAULT_IMAGE;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>

      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {keywords && <meta name="keywords" content={keywords} />}

      <meta name="author" content="Silaigo | Ankit Singh" />
      <meta name="language" content="English" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Robots */}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
    </>
  );
};
