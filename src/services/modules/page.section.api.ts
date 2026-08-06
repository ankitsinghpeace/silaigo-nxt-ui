import { apiFetch } from "@/hooks/interceptor";

export const fetchNavbarData = async (): Promise<any> => {
  const res = await apiFetch<any>(`page-sections/navbar`, {
    method: "GET",
    auth: true,
  });
  return res.data?.data;
};

type FetchPageSectionOptions = {
  isActiveKey?: string;
  isEditPage?: boolean;
};

export const fetchPageSectionData = async (
  componentKey: string,
  options: FetchPageSectionOptions = {}
): Promise<any> => {
  const { isActiveKey = componentKey, isEditPage = false } = options;

  const params = new URLSearchParams();
  if (isActiveKey) {
    params.append("key", isActiveKey);
  }

  const url = `page-sections/${componentKey}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const res = await apiFetch<any>(url, {
    method: "GET",
    auth: true,
  });

  const componentData = res.data;
  let section = componentData[isActiveKey];
  const rest = Object.fromEntries(
    Object.entries(componentData).filter(([k]) => k !== isActiveKey)
  );

  if (Array.isArray(section) && !isEditPage) {
    section = section.filter((item: any) => item?.isActive === true);
  }

  return { [isActiveKey]: section, ...rest };
};

export const UpdatePageSectionData = async (
  value: any,
  componentKey: string,
  isNested: boolean = true
): Promise<any> => {
  const body = isNested ? { data: { [componentKey]: value } } : { data: value };

  const res: any = await apiFetch(`page-sections/${componentKey}`, {
    method: "PUT",
    auth: true,
    body,
  });

  return res?.data?.data;
};


export const fetchCategoryById = async (categoryId: string): Promise<any> => {
  try {
    const res = await apiFetch<any>(`subcategory/${categoryId}`, {
      method: "GET",
      auth: true,
    });
    if (res?.data) {
      return res; // Successfully fetched the category data
    } else {
      throw new Error("Category data not found in response");
    }
  } catch (error) {
    console.error("Error fetching category data:", error);
    throw new Error("Failed to fetch category data");
  }
};


export const fetchAllMetaMaster = async (): Promise<any> => {
  try {
    const res = await apiFetch<any>(`meta-master`, {
      method: "GET",
      auth: true, // Assuming auth is required
    });

    if (res?.data) {
      return res.data; // Return the array of meta banners
    } else {
      throw new Error("Meta data not found in response");
    }
  } catch (error) {
    console.error("Error fetching meta master data:", error);
    throw new Error("Failed to fetch meta master data");
  }
};
