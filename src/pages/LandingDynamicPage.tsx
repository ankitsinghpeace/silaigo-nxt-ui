"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/config";

const LandingDynamicPage = () => {
  const params = useParams<{ location?: string; category?: string }>();
  const location = params?.location;
  const category = params?.category;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!location) return;
    fetch(`${getApiBaseUrl()}/landing-pages/routes`)

      .then((res) => res.json())
      .then((res) => {
        const mappings = res?.data?.locationsCategoryMappings || [];
        const match = mappings.find(
          (item: any) =>
            item.location.toLowerCase().replace(/\s+/g, "-") === location &&
            (!category ||
              item.category.toLowerCase().replace(/\s+/g, "-") === category),
        );
        setData(match);
      })
      .catch(() => setData(null));
  }, [location, category]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dynamic Landing Page</h1>
      <p>Location: {location}</p>
      {category && <p>Category: {category}</p>}
      {data ? (
        <pre className="mt-4 bg-muted p-4 rounded overflow-auto text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="mt-4">Loading...</p>
      )}
    </div>
  );
};

export default LandingDynamicPage;
