import { IAddress, IProfile } from "@/types/interface";
import { apiFetch } from "@/hooks/interceptor";

interface ApiResponse<T> {
  data: T;
}

export const getProfile = async (): Promise<IProfile> => {
  const res = await apiFetch<ApiResponse<IProfile>>(`auth/profile`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const updateProfile = async (profile: IProfile): Promise<IProfile> => {
  const res = await apiFetch<ApiResponse<any>>(`auth/profile`, {
    method: "PUT",
    auth: true,
    body: profile,
  });
  return res.data.user;
};

export const getAddress = async (): Promise<IAddress[]> => {
  const res = await apiFetch<ApiResponse<any>>(`address`, {
    method: "GET",
    auth: true,
  });
  return res.data as IAddress[];
};

export const addAddress = async (
  address: Omit<IAddress, "_id"> & { impersonateUserId?: string }
): Promise<IAddress> => {
  const res = await apiFetch<ApiResponse<IAddress>>(`address`, {
    method: "POST",
    auth: true,
    body: address,
  });
  return res.data;
};

export const updateAddress = async (
  id: string,
  address: Omit<IAddress, "_id">
): Promise<IAddress> => {
  const res = await apiFetch<ApiResponse<IAddress>>(`address/${id}`, {
    method: "PUT",
    auth: true,
    body: address,
  });
  return res.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<void>>(`address/${id}`, {
    method: "DELETE",
    auth: true,
  });
};
