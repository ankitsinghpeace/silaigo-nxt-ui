import { apiFetch } from "@/hooks/interceptor";

export const fetchAllCategories = async (): Promise<any> => {
  const res = await apiFetch<any>(`category`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const fetchCategoryTypeData = async (
  componentKey: string
): Promise<any> => {
  const res = await apiFetch<any>(`category/${componentKey}`, {
    method: "GET",
    auth: true,
  });

  return res.data;
};

export const fetchSubCategoryData = async (
  categoryId: number
): Promise<any> => {
  const res = await apiFetch<any>(`category/id/${categoryId}`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const updateCategories = async (
  categoryId: number,
  data: any
): Promise<any> => {
  const res: any = await apiFetch(`category`, {
    method: "PUT",
    auth: true,
    body: data,
  });

  return res?.data;
};

export const createCategory = async (data: any): Promise<any> => {
  const res: any = await apiFetch(`category`, {
    method: "POST",
    auth: true,
    body: data,
  });
  return res?.data;
};

export const deleteCategory = async (categoryId: number): Promise<any> => {
  const res: any = await apiFetch(`category/${categoryId}`, {
    method: "DELETE",
    auth: true,
  });
  return res?.data?.data;
};

export const updateCategoryStyles = async (
  categoryId: number,
  styles: any[]
): Promise<any> => {
  const res = await apiFetch<any>(`category/id/${categoryId}`, {
    method: "PUT",
    auth: true,
    body: { styles },
  });
  return res.data;
};

export const getCustomizationData = async (): Promise<any> => {
  const res = await apiFetch<any>(`customizations`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const addCustomizationOptionsData = async (
  type: string,
  customization: any
): Promise<any> => {
  const res = await apiFetch<any>(`customizations/options/${type}`, {
    method: "POST",
    auth: true,
    body: customization,
  });
  console.log(res.data);
  return res.data;
};

export const removeCustomizationOptionsData = async (
  type: string,
  optionsId: number[]
): Promise<any> => {
  const res = await apiFetch<any>(`customizations/options/${type}`, {
    method: "DELETE",
    auth: true,
    body: optionsId,
  });
  return res.data;
};

export const updateCustomizationOptionsData = async (
  type: string,
  customization: any
): Promise<any> => {
  const res = await apiFetch<any>(`customizations/options/${type}`, {
    method: "PUT",
    auth: true,
    body: customization,
  });
  return res.data;
};

export const getMetaTypes = async (): Promise<string[]> => {
  const res = await apiFetch<{ data: string[] }>(`meta-master/types/banner`, {
    method: "GET",
    auth: true,
  });
  return res?.data;
};

export const getSubCategoryStyleDetails = async (
  subCategoryId: string,
  subCategoryStyleId: string
): Promise<any> => {
  const res = await apiFetch<any>(
    `subcategory/${subCategoryId}/${subCategoryStyleId}`,
    {
      method: "GET",
    }
  );
  return res.data;
};

export const getCustomizationMapping = async () => {
  const res = await apiFetch<any>(`customizations/mapping`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const addCustomizationMapping = async (mapping: any) => {
  const res = await apiFetch<any>(`customizations/mapping`, {
    method: "POST",
    body: { mapping },
    auth: true,
  });
  return res.data;
};

export const editCustomizationMapping = async (mapping: any, id: string) => {
  const res = await apiFetch<any>(`customizations/mapping`, {
    method: "PUT",
    body: { mapping, id },
    auth: true,
  });
  return res.data;
};

export const deleteCustomizationMapping = async (id: string) => {
  const res = await apiFetch<any>(`customizations/mapping`, {
    method: "DELETE",
    body: { id },
    auth: true,
  });
  return res.data;
};

export const getCustomizationMappingOptions = async ({
  subCategoryId,
  categoryId,
  customizationType,
}) => {
  const res = await apiFetch<any>(
    `customizations/options-mapping?subCategoryId=${subCategoryId}&categoryId=${categoryId}&customizationType=${customizationType}`,
    {
      method: "GET",
    }
  );
  if (res.data.length > 0) {
    return res.data[0].options || [];
  }
  return [];
};

export const getCustomizationTypesList = async () => {
  const res = await apiFetch<any>(`customizations/types`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const getMetaMasterDataList = async (searchParams: any) => {
  const res = await apiFetch<any>(
    `meta-master/all?${new URLSearchParams(searchParams).toString()}`,
    {
      method: "GET",
      auth: true,
    }
  );
  return res.data;
};

export const updateCustomizationRank = async (type: string, rank: number) => {
  const res = await apiFetch<any>(`customizations/rank`, {
    method: "PUT",
    body: { type, rank },
    auth: true,
  });
  return res.data;
};
