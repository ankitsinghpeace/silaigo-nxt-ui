export const getRouterQueryValue = (
  query: Record<string, string | string[] | undefined> | undefined,
  key: string,
) => {
  const value = query?.[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export const buildRouterQuery = (
  query: Record<string, string | string[] | undefined> | undefined,
  updates: Record<string, string | undefined> = {},
) => {
  const nextQuery: Record<string, string> = {};

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const firstValue = value[0];
      if (firstValue) {
        nextQuery[key] = firstValue;
      }
    } else if (value) {
      nextQuery[key] = value;
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      delete nextQuery[key];
    } else {
      nextQuery[key] = value;
    }
  });

  return nextQuery;
};

export const getQueryString = (
  query: Record<string, string | string[] | undefined> | undefined,
) => {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) params.append(key, item);
      });
    } else if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
};
