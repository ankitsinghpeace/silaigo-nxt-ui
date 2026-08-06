import { apiFetch } from "@/hooks/interceptor";
import Cookies from "js-cookie";

export enum UserRole {
  ADMIN = "ADMIN",
  MARKETING = "MARKETING",
  SALES = "SALES",
  SUPPORT = "SUPPORT",
  TAILOR = "TAILOR",
  CONTENT = "CONTENT",
  CUSTOMER = "customer",
  PICKUP_COORDINATOR = "PICKUP_COORDINATOR",
  CUTTING = "CUTTING",
  STITCHING = "STITCHING",
}

export interface User {
  userId: any;
  tokens: any;
  id: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  role?: UserRole;
  permissions?: string[];
  notes?: string;
  colorCode?: string;
}

export type AdminEditCustomer = Pick<
  User,
  | "firstName"
  | "lastName"
  | "gender"
  | "phone"
  | "notes"
  | "userId"
  | "colorCode"
>;

export const LOGIN_TIMESTAMP_KEY = "silai_login_timestamp";
export const ACCESS_TOKEN_KEY = "silai_access_token";
export const REFRESH_TOKEN_KEY = "silai_refresh_token";
export const RT_EXPIRES_AT_KEY = "silai_rt_expires_at";
export const AT_EXPIRES_AT_KEY = "silai_at_expires_at";
export const USER_KEY = "user";

export const refreshToken = async (refreshToken: string) => {
  const res = await apiFetch<{
    data: any;
    accessToken: string;
    refreshToken: string;
    atExpiresAt: string;
    rtExpiresAt: string;
  }>("auth/refresh-token", {
    method: "POST",
    body: { refreshToken },
  });
  return res.data;
};

export const logout = (): void => {
  // clearSession();
};

export const logoutFromServer = async (): Promise<void> => {
  try {
    await apiFetch("auth/logout", { method: "POST", auth: true });
  } catch (e) {
    console.error("Logout server error:", e);
  }
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const getCurrentUserFromServer = async (): Promise<any> => {
  const res: any = await apiFetch<{
    data: User;
  }>("auth/me", {
    method: "GET",
    auth: true,
    body: {},
  });
  return res?.data?.user;
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
  const rtExpiresAt = localStorage.getItem(RT_EXPIRES_AT_KEY);
  if (!token || !rt || !rtExpiresAt) return false;
  return Date.now() < new Date(rtExpiresAt).getTime();
};

export const login = async (email: string, password: string): Promise<User> => {
  const res = await apiFetch<{
    data: any;
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      atExpiresAt: string;
      rtExpiresAt: string;
    };
  }>("auth/internal-login", {
    method: "POST",
    body: { email, password },
  });

  return res.data;
};

export const customerLogin = async (otpId: string, otpCode: string) => {
  const res = await apiFetch<{
    data: any;
    status: boolean;
    message: string;
    registrationToken?: string;
    user?: User;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      atExpiresAt: string;
      rtExpiresAt: string;
    };
    newUser?: boolean;
  }>("auth/customer-login", {
    method: "POST",
    body: { otpId, otpCode },
  });
  return res.data;
};

export const createProfile = async (profileData: {
  phone: string;
  firstName: string;
  lastName: string;
  registrationToken: string;
}) => {
  const res = await apiFetch<{
    data: any;
    status: boolean;
    message: string;
    user?: User;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      atExpiresAt: string;
      rtExpiresAt: string;
    };
  }>("auth/create-profile", {
    method: "POST",
    body: profileData,
  });

  return res.data;
};

export const generateOTP = async (phone: string) => {
  const res = await apiFetch<{
    data: any;
    otpId: string;
    expiresAt: string;
  }>("auth/generate-otp", {
    method: "POST",
    body: { phone },
  });
  return res.data;
};

export const verifyOTP = async (otpId: string, otpCode: string) => {
  const res = await apiFetch<{
    data: any;
    status: boolean;
    message: string;
  }>("auth/verify-otp", {
    method: "POST",
    body: { otpId, otpCode },
  });
  return res.data;
};

export const resendOTP = async (otpId: string) => {
  const res = await apiFetch<{
    data: any;
    status: boolean;
    message: string;
  }>("auth/resend-otp", {
    method: "POST",
    body: { otpId },
  });
  return res.data;
};

export const updateUserAccount = async (userData: {
  email: string;
  password: string;
}): Promise<User> => {
  const res = await apiFetch<{
    data: any;
    user: User;
  }>("auth/user", {
    method: "PUT",
    body: userData,
    auth: true,
  });
  return res.data.user;
};

export const createTeamMember = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  designation: string;
  role: string;
  joiningDate: string;
}) => {
  const res = await apiFetch<any>("auth/team-members", {
    method: "POST",
    body: userData,
    auth: true,
  });
  return res.data;
};

export const updateTeamMember = async (
  id: string,
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    designation: string;
    role: string;
    joiningDate: string;
  },
) => {
  const res = await apiFetch<any>(`auth/team-members/${id}`, {
    method: "PUT",
    body: userData,
    auth: true,
  });
  return res.data;
};

export const changePassword = async (payload: {
  id: string;
  oldPassword: string;
  newPassword: string;
}) => {
  const res = await apiFetch<any>(`auth/change-password`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const getTeamMembers = async () => {
  const res = await apiFetch<any>(`auth/team-members`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const getRoles = async () => {
  const res = await apiFetch<any>(`auth/roles`, {
    method: "GET",
    auth: true,
  });

  return res.data;
};

export const removeTeamMember = async (teamMemberId: string) => {
  const res = await apiFetch<any>(`auth/team-members/${teamMemberId}`, {
    method: "DELETE",
    auth: true,
  });
  return res.data;
};

export const getTeamMembersViaRole = async (roleCode: string) => {
  const res = await apiFetch<any>(`auth/team-members-via-role/${roleCode}`, {
    method: "GET",
    auth: true,
  });
  return res.data;
};

export const getCustomersList = async (searchParams: any) => {
  const res = await apiFetch<any>(
    `auth/customers?${new URLSearchParams(searchParams).toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );
  return res.data;
};

export const deleteCustomers = async (customerIds: string[]) => {
  const res = await apiFetch<any>(`auth/customers`, {
    method: "DELETE",
    auth: true,
    body: { customerIds },
  });
  return res.data;
};

export const deleteOrder = async (orderId: string) => {
  const res = await apiFetch<any>(`auth/orders`, {
    method: "DELETE",
    auth: true,
    body: { orderId }, // sending a single orderId
  });
  return res.data;
};

export const editCustomer = async (
  customerId: string,
  customerData: AdminEditCustomer,
) => {
  const res = await apiFetch<any>(`auth/customers/${customerId}`, {
    method: "PUT",
    auth: true,
    body: customerData,
  });
  return res.data;
};

export const addUserByadmin = async (customerData: any) => {
  const res = await apiFetch<any>(`auth/customers`, {
    method: "POST",
    auth: true,
    body: customerData,
  });
  return res.data;
};
