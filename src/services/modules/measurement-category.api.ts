import { apiFetch } from "@/hooks/interceptor";
import { IMeasurementCategory } from "@/types/interface";

export const listMeasurementCategories = async () => {
  const res = await apiFetch<any>(`measurement-category`, {
    auth: true,
    method: "GET",
  });
  return res.data;
};

export const listUserBodyMeasurement = async (phone: string) => {
  const res = await apiFetch<any>(`measurement-category/user/${phone}`, {
    auth: true,
    method: "GET",
  });
  return res.data;
};

export const listMeasurementFields = async () => {
  const res = await apiFetch<any>(`measurement-category/fields`, {
    auth: true,
    method: "GET",
  });
  return res.data;
};

export const addMeasurementCategories = async (data: IMeasurementCategory) => {
  const res = await apiFetch<any>(`measurement-category`, {
    auth: true,
    method: "POST",
    body: data,
  });
  return res.data;
};

export const addMeasurementField = async (data: IMeasurementCategory) => {
  const res = await apiFetch<any>(`measurement-category/fields`, {
    auth: true,
    method: "POST",
    body: data,
  });
  return res.data;
};

export const deleteMeasurementFieldApi = async (id: string) => {
  const res = await apiFetch<any>(`measurement-category/fields/${id}`, {
    auth: true,
    method: "DELETE",
  });
  return res.data;
};

export const deleteMeasurementCategoryApi = async (id: string) => {
  const res = await apiFetch<any>(`measurement-category/${id}`, {
    auth: true,
    method: "DELETE",
  });
  return res.data;
};

export const editMeasurementCategoryApi = async (
  data: IMeasurementCategory
) => {
  const res = await apiFetch<any>(`measurement-category`, {
    auth: true,
    method: "PATCH",
    body: data,
  });
  return res.data;
};
