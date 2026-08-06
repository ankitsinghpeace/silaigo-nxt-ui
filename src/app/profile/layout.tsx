"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Gender } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Pencil, X, LogOut, ChevronRight } from "lucide-react";
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
  { label: "Orders", path: "/profile/orders" },
  { label: "Address", path: "/profile/address" },
  { label: "Saved Cards", path: "/profile/saved-cards" },
  { label: "Customer Care", path: "/profile/customer-care" },
  { label: "Invite Friends & Earn", path: "/profile/invite-friends" },
  { label: "My Rewards", path: "/profile/rewards" },
  { label: "Notifications", path: "/profile/notifications" },
  { label: "Logout", path: "#", isLogout: true },
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
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

    if (isDesktop && pathname === "/profile") {
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
    <div className="w-full min-h-screen bg-background flex flex-col items-center px-2 py-6 sm:px-0">
      <MetaTagsProvider
        title="My Profile | SilaiGo"
        description="Manage your profile"
        canonicalPath="/profile"
        noindex
      />

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
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
            {menuItems.map((item) =>
              item.isLogout ? (
                <button
                  key={item.label}
                  onClick={logout}
                  className="w-full p-4 flex items-center justify-between hover:bg-accent text-destructive"
                >
                  <span>{item.label}</span>

                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`p-4 flex items-center justify-between hover:bg-accent ${
                    pathname === item.path ? "bg-accent font-medium" : ""
                  }`}
                >
                  <span>{item.label}</span>

                  <ChevronRight className="w-5 h-5" />
                </Link>
              ),
            )}
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1">
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
            children
          )}
        </div>
      </div>
    </div>
  );
}
