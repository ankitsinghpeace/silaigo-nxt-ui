import { apiFetch } from "@/hooks/interceptor";
import { IAvailabilityOverride, ScheduleConfig } from "@/types/interface";

export const getAppointmentsSlotsApi = async (date: string) => {
  const res = await apiFetch<any>(`appointments/slots?date=${date}`, {
    auth: true,
  });
  return res.data;
};

export const bookAppointmentApi = async ({
  dateStr,
  time,
  orderId,
  notes,
  addressId,
  impersonateUserId,
}: {
  dateStr: string;
  time: string;
  orderId?: string;
  notes?: string;
  addressId?: string;
  impersonateUserId?: string;
}) => {
  const res = await apiFetch<any>(`appointments/book`, {
    method: "POST",
    body: {
      dateStr,
      time,
      orderId,
      notes,
      addressId,
      impersonateUserId,
    },
    auth: true,
  });
  return res.data;
};

export const getScheduleConfigApi = async () => {
  const res = await apiFetch<any>(`appointments/schedule`, {
    auth: true,
  });
  return res.data;
};

export const updateScheduleConfigApi = async (
  scheduleConfig: ScheduleConfig
) => {
  const res = await apiFetch<any>(
    `appointments/schedule/${scheduleConfig._id}`,
    {
      method: "PUT",
      body: scheduleConfig,
      auth: true,
    }
  );
  return res.data;
};

export const getAvailabilitiesApi = async () => {
  const res = await apiFetch<any>(`appointments/availability-overrides`, {
    auth: true,
  });
  console.log(res.data);
  return res.data;
};

export const addAvailabilityApi = async (
  availability: IAvailabilityOverride,
  clearPreviousData: boolean
) => {
  const res = await apiFetch<any>(
    `appointments/availability-overrides?clearPrevious=${clearPreviousData}`,
    {
      method: "POST",
      body: availability,
      auth: true,
    }
  );
  return res.data;
};

export const updateAvailabilityApi = async (
  availability: IAvailabilityOverride
) => {
  const res = await apiFetch<any>(
    `appointments/availability-overrides/${availability._id}`,
    {
      method: "PUT",
      body: availability,
      auth: true,
    }
  );
  return res.data;
};

export const deleteAvailabilityApi = async (availabilityId: string) => {
  const res = await apiFetch<any>(
    `appointments/availability-overrides/${availabilityId}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
  return res.data;
};
