import { apiFetch } from "@/hooks/interceptor";

export const schedulePhoneCall = async (body): Promise<any> => {
  const res = await apiFetch<any>(`phone-call-schedule`, {
    method: "POST",
    auth: true,
    body,
  });
  return res.data;
};

export const getScheduledCallsList = async (
  searchParams: any
): Promise<any> => {
  const res = await apiFetch<any>(
    `phone-call-schedule?${new URLSearchParams(searchParams).toString()}`,
    {
      method: "GET",
      auth: true,
    }
  );
  return res.data;
};

export const updateScheduledCallStatus = async (call: any): Promise<any> => {
  const res = await apiFetch<any>(`phone-call-schedule/${call._id}`, {
    method: "PUT",
    auth: true,
    body: { call },
  });
  return res.data;
};
