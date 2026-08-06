"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/config";

export const useDynamicRoutes = () => {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/landing-pages/routes`)
      .then((res) => res.json())
      .then((res) => {
        setRoutes(res?.data?.locationsCategoryMappings || []);
      })
      .catch(() => setRoutes([]));
  }, []);

  return routes;
};
