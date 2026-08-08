"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  login as adminLoginApi,
  customerLogin as customerLoginApi,
  createProfile as createProfileApi,
  getCurrentUserFromServer,
  logoutFromServer,
  User,
  UserRole,
  LOGIN_TIMESTAMP_KEY,
} from "@/services/auth.api";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  customerLogin: (
    otpId: string,
    otpCode: string,
    shouldRedirect?: boolean,
  ) => Promise<{
    status: boolean;
    message: string;
    registrationToken?: string;
    user?: User;
    newUser?: boolean;
  }>;
  createProfile: (
    data: {
      phone: string;
      firstName: string;
      lastName: string;
      registrationToken: string;
      gender: string;
    },
    shouldRedirect?: boolean,
  ) => Promise<{ status: boolean; message: string; user?: User }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  accessibleSections: () => string[];
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams: any = useSearchParams();

  const redirect = searchParams.get("redirect");

  const updateUserState = useCallback((userData: User | null) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) {
      updateUserState(null);
      return;
    }

    try {
      const user = await getCurrentUserFromServer();
      updateUserState(user);
    } catch (error: any) {
      if (error?.status === 401) {
        updateUserState(null);
      } else {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const adminLogin = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response: any = await adminLoginApi(email, password);
        if (response?.user) {
          updateUserState(response.user);
          localStorage.setItem(
            LOGIN_TIMESTAMP_KEY,
            JSON.stringify(new Date().getTime()),
          );

          router.push(
            redirect ||
              (response.user.role === UserRole.ADMIN
                ? "/admin/dashboard"
                : "/profile"),
          );
          return true;
        }
        return false;
      } catch (err) {
        toast({ title: "Admin login failed" });
        return false;
      }
    },
    [router, redirect, toast, updateUserState],
  );

  const customerLogin = useCallback(
    async (
      otpId: string,
      otpCode: string,
      shouldRedirect: boolean = true,
    ): Promise<{
      status: boolean;
      message: string;
      registrationToken?: string;
      user?: User;
      newUser?: boolean;
    }> => {
      try {
        const res = await customerLoginApi(otpId, otpCode);
        const { status, user: loggedInUser, newUser, registrationToken } = res;

        if (status && loggedInUser) {
          updateUserState(loggedInUser);
          localStorage.setItem(
            LOGIN_TIMESTAMP_KEY,
            JSON.stringify(new Date().getTime()),
          );
          if (shouldRedirect) {
            router.push(redirect || "/phone-call-schedule?catId=4");
          }
          return {
            status: true,
            message: "User logged in successfully",
            user: loggedInUser,
          };
        }

        if (status && newUser && registrationToken) {
          return {
            status: true,
            message: "User registered successfully",
            registrationToken,
            newUser: true,
          };
        }

        return { status: false, message: "Login failed" };
      } catch (error: any) {
        return { status: false, message: generateErrorMessage(error) };
      }
    },
    [router, redirect, updateUserState],
  );

  const createProfile = useCallback(
    async (
      profileData: {
        phone: string;
        firstName: string;
        lastName: string;
        registrationToken: string;
        gender: string;
      },
      shouldRedirect: boolean = true,
    ) => {
      try {
        const res = await createProfileApi(profileData);
        const { status, user: newUser } = res;

        if (status && newUser) {
          updateUserState(newUser);
          localStorage.setItem(
            LOGIN_TIMESTAMP_KEY,
            JSON.stringify(new Date().getTime()),
          );
          if (shouldRedirect) {
            router.push(redirect || "/phone-call-schedule?catId=4");
          }
          return {
            status: true,
            message: "Profile created successfully",
            user: newUser,
          };
        }

        return { status: false, message: "Create profile failed" };
      } catch (error: any) {
        return { status: false, message: generateErrorMessage(error) };
      }
    },
    [router, redirect, updateUserState],
  );

  const logout = useCallback(async () => {
    await logoutFromServer();
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
    updateUserState(null);
    // window.location.reload();
    router.push(
      user?.role === UserRole.CUSTOMER.toLowerCase()
        ? "/login"
        : "/admin/login",
    );
  }, [user]);

  const accessibleSections = useCallback((): string[] => {
    if (!user || !user.permissions) return [];
    const sections: string[] = [];

    // Dashboard section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("dashboard.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("dashboard");

    // Category section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("category.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("category");

    // Profile section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("profile.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("profile");

    // Order section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("order.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("orders");

    // Payment section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("payment.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("payment");

    // User section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("user.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("users");

    // Content section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("content.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("content");

    // Analytics section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("analytics.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("analytics");

    // Customers section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("customers.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("customers");

    // Customizations section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("customizations.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("customizations");

    // Appointments section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("appointments.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("appointments");

    // Inventory section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("inventory.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("inventory");

    // Roles section
    if (
      user.permissions.some(
        (perm) =>
          perm.startsWith("roles.") &&
          ["view", "create", "edit", "delete"].includes(perm.split(".")[1]),
      )
    )
      sections.push("settings");

    sections.push("change-password");
    return sections;
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      adminLogin,
      customerLogin,
      createProfile,
      logout,
      hasPermission,
      refreshUser,
      accessibleSections,
      setUser,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      adminLogin,
      customerLogin,
      createProfile,
      logout,
      hasPermission,
      refreshUser,
      accessibleSections,
      setUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // During build time or SSR, provide a default context to prevent build failures
    // This is a defensive measure - in normal operation, the provider should be present
    if (typeof window === 'undefined') {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        adminLogin: async () => false,
        customerLogin: async () => ({ status: false, message: 'Not in client context' }),
        createProfile: async () => ({ status: false, message: 'Not in client context' }),
        logout: () => {},
        hasPermission: () => false,
        refreshUser: async () => {},
        accessibleSections: () => [],
        setUser: () => {},
      };
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
