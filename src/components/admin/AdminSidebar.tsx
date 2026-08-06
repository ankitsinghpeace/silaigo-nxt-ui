"use client";
import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Sparkles,
  UserCog,
  BadgePercent,
  PhoneCall,
  LockKeyhole,
  RulerIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/auth.api";
import Link from "next/link";

interface AdminSidebarProps {
  isCollapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed }) => {
  const { logout, accessibleSections, user } = useAuth();
  const pathname = usePathname() ?? "";
  const navItems = [
    // {
    //   name: "Dashboard",
    //   icon: LayoutDashboard,
    //   href: "/admin/dashboard",
    //   section: "dashboard",
    // },
    {
      name: "Content",
      icon: Sparkles,
      section: ["content", "inventory"],
      children: [
        {
          name: "Landing Page",
          icon: Sparkles,
          href: "/admin/content/landing",
          section: ["content"],
        },
        {
          name: "Category",
          icon: Sparkles,
          href: "/admin/content/category",
          section: ["inventory"],
        },
        {
          name: "Blog",
          icon: Sparkles,
          href: "/admin/content/blog",
          section: ["content"],
        },
      ],
    },
    {
      name: "Scheduled Calls",
      icon: PhoneCall,
      href: "/admin/scheduled-phone-calls",
      section: ["customers"],
    },
    {
      name: "Orders",
      icon: ShoppingBag,
      href: "/admin/orders",
      section: ["orders"],
    },
    {
      name: "Coupons",
      icon: BadgePercent,
      href: "/admin/coupons",
      section: ["content"],
    },
    {
      name: "Customers",
      icon: Users,
      href: "/admin/customers",
      section: ["customers"],
    },
    {
      name: "User Management",
      icon: UserCog,
      href: "/admin/users",
      section: ["users"],
    },
    {
      name: "Settings",
      icon: Settings,
      href: "/admin/settings",
      section: ["settings", "appointments"],
    },
    {
      name: "Measurements",
      icon: RulerIcon,
      href: "/admin/measurements",
      section: ["settings", "orders"],
    },
    {
      name: "Change Password",
      icon: LockKeyhole,
      href: "/admin/change-password",
      section: ["change-password", "settings"],
    },
  ];
  const allowedSections = accessibleSections();
  const allowedNavItems = navItems.filter((item) =>
    allowedSections.some((section) => item.section.includes(section)),
  );

  return (
    <div
      className={cn(
        "bg-white/90 backdrop-blur-sm shadow-md flex min-h-[850px] h-min-screen flex-col p-4 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Top content: header, user info, nav */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Header */}
        <div
          className={cn(
            "flex items-center mb-8 transition-all",
            isCollapsed ? "justify-center" : "justify-start px-2",
          )}
        ></div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="mb-6 px-2 py-3 bg-muted/40 rounded-lg">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="mt-1">
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-grow overflow-auto space-y-1">
          {allowedNavItems.map((item) =>
            item.children ? (
              <div key={item.name}>
                <div
                  className={cn(
                    "flex items-center py-2 px-3 rounded-lg text-sm font-semibold text-gray-600",
                    isCollapsed && "justify-center px-0",
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && (
                  <div className="pl-6 space-y-1">
                    {item.children.map(
                      (subItem) =>
                        allowedSections.some((section) =>
                          subItem.section.includes(section),
                        ) && (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                              pathname === subItem.href
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 hover:bg-primary/10 hover:text-primary",
                            )}
                          >
                            <subItem.icon className="h-4 w-4 mr-2" />
                            <span>{subItem.name}</span>
                          </Link>
                        ),
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center py-2 px-3 rounded-lg text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-primary/10 hover:text-primary",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ),
          )}
        </nav>
      </div>

      {/* Logout button */}
      <Button
        variant="ghost"
        size={isCollapsed ? "icon" : "default"}
        onClick={logout}
        className={cn(
          "justify-start hover:bg-destructive/10 hover:text-destructive mt-4",
          isCollapsed && "justify-center",
        )}
      >
        <LogOut className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
        {!isCollapsed && <span>Logout</span>}
      </Button>
    </div>
  );
};

export default AdminSidebar;
