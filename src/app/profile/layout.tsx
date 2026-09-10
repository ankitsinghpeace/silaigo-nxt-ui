"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Gender } from "@/types/enums";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  X,
  LogOut,
  ChevronRight,
  Package,
  MapPin,
  CreditCard,
  Headphones,
  Share2,
  Award,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { updateProfile } from "@/services/modules/profile.api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/services/auth.api";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { generateErrorMessage } from "@/lib/helpers";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { label: "Orders", path: "/profile/orders", icon: Package },
  { label: "Address", path: "/profile/address", icon: MapPin },
  { label: "Saved Cards", path: "/profile/saved-cards", icon: CreditCard },
  { label: "Customer Care", path: "/profile/customer-care", icon: Headphones },
  { label: "Invite Friends & Earn", path: "/profile/invite-friends", icon: Share2 },
  { label: "My Rewards", path: "/profile/rewards", icon: Award },
  { label: "Notifications", path: "/profile/notifications", icon: Bell },
  { label: "Logout", path: "#", isLogout: true, icon: LogOut },
];

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return "N/A";

  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, setUser } = useAuth();
  const { toast } = useToast();

  const router = useRouter();
  const pathname = usePathname();

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    gender: (user?.gender as Gender) || Gender.NOT_SPECIFIED,
    birthDate: user?.birthDate ? new Date(user.birthDate) : null,
  });

  useEffect(() => {
    if (pathname === "/profile") {
      router.replace("/profile/orders");
    }
  }, [pathname, router]);

  const isOnRootProfile = pathname === "/profile";

  const handleFormReset = () => {
    setProfile({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      gender: (user?.gender as Gender) || Gender.NOT_SPECIFIED,
      birthDate: user?.birthDate ? new Date(user.birthDate) : null,
    });

    setIsEditingPersonal(false);
  };

  const handleSavePersonal = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      const res = await updateProfile({
        ...profile,
        gender: profile.gender as Gender,
      });

      if (res) {
        setUser(res as unknown as User);
      }

      setIsEditingPersonal(false);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center px-3 py-4 sm:px-0 sm:py-6">
      <MetaTagsProvider
        title="My Profile | SilaiGo"
        description="Manage your profile"
        canonicalPath="/profile"
        noindex
      />

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        {/* Mobile Profile Card */}
        <div className="flex md:hidden flex-col gap-3 w-full">
          <div className="bg-card rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                {getInitials(user?.firstName, user?.lastName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold capitalize truncate">
                  {user?.firstName} {user?.lastName}
                </div>

                <div className="text-muted-foreground text-xs truncate">
                  {user?.email}
                </div>

                {user?.phone && (
                  <div className="text-muted-foreground text-xs truncate">
                    {user?.phone}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 text-xs px-2.5 h-8"
                onClick={() => setIsEditingPersonal(true)}
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-full md:w-[380px] flex-shrink-0 flex-col gap-4 sticky top-0 z-10 bg-background">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                {getInitials(user?.firstName, user?.lastName)}
              </div>

              <div className="flex-1">
                <div className="text-lg font-semibold capitalize">
                  {user?.firstName} {user?.lastName}
                </div>

                <div className="text-muted-foreground text-sm">
                  {user?.email}
                </div>

                <div className="text-muted-foreground text-sm">
                  {user?.phone}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPersonal(true)}
              >
                Edit
              </Button>
            </div>
          </div>

          <nav className="bg-card rounded-lg shadow-sm border divide-y">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return item.isLogout ? (
                <button
                  key={item.label}
                  onClick={logout}
                  className="w-full p-4 flex items-center justify-between hover:bg-accent text-destructive font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-destructive" />
                    <span>{item.label}</span>
                  </div>

                  <LogOut className="w-5 h-5 text-destructive" />
                </button>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`p-4 flex items-center justify-between hover:bg-accent transition-colors ${
                    pathname === item.path ? "bg-accent font-medium text-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col gap-6">
          {isEditingPersonal ? (
            <form
              className="bg-card rounded-lg shadow-sm border p-6"
              onSubmit={handleSavePersonal}
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Edit Profile</h2>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFormReset}
                  >
                    <X size={16} />
                    Cancel
                  </Button>

                  <Button type="submit">
                    <Pencil size={16} />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      firstName: e.target.value,
                    })
                  }
                  placeholder="First Name"
                  className="w-full p-2 border rounded-md"
                />

                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      lastName: e.target.value,
                    })
                  }
                  placeholder="Last Name"
                  className="w-full p-2 border rounded-md"
                />

                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  placeholder="Email"
                  className="w-full p-2 border rounded-md"
                />

                <Select
                  value={profile.gender}
                  onValueChange={(value) =>
                    setProfile({
                      ...profile,
                      gender: value as Gender,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={Gender.MALE}>Male</SelectItem>

                    <SelectItem value={Gender.FEMALE}>Female</SelectItem>

                    <SelectItem value={Gender.OTHER}>Other</SelectItem>

                    <SelectItem value={Gender.NOT_SPECIFIED}>
                      Not specified
                    </SelectItem>
                  </SelectContent>
                </Select>

                <input
                  type="date"
                  value={
                    profile.birthDate
                      ? format(profile.birthDate, "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      birthDate: new Date(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </form>
          ) : (
            <>
              {children}

              {/* Mobile Vertical Menu List under content / no orders found */}
              <div className="block md:hidden">
                <nav className="bg-card rounded-lg shadow-sm border divide-y w-full">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return item.isLogout ? (
                      <button
                        key={item.label}
                        onClick={logout}
                        className="w-full p-4 flex items-center justify-between hover:bg-accent text-destructive font-medium"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-destructive" />
                          <span>{item.label}</span>
                        </div>

                        <LogOut className="w-5 h-5 text-destructive" />
                      </button>
                    ) : (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`p-4 flex items-center justify-between hover:bg-accent transition-colors ${
                          pathname === item.path ? "bg-accent font-medium text-primary" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <span>{item.label}</span>
                        </div>

                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
