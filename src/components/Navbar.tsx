"use client";
import React, { useState, useEffect } from "react";
import { INavbar } from "@/types/interface";
import { Menu, X, ShoppingCart, User, LockKeyhole, LogOut } from "lucide-react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/services";
import { useRouter } from "@/lib/next-router-compat";

interface NavbarProps {
  navbar: INavbar;
}

const Navbar: React.FC<NavbarProps> = ({ navbar }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [isAdminDomain, setIsAdminDomain] = useState(false);
  const router = useRouter();
  useEffect(() => {
    window.scrollTo(0, 0);
    const hostname = window.location.href;
    if (hostname.includes("admin")) {
      setIsAdminDomain(true);
    } else {
      setIsAdminDomain(false);
    }
  }, [router.asPath]);

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-white shadow-md py-3 will-change-transform">
      <div className="px-4 sm:px-6 lg:px-12">
        {/* Mobile View */}
        <div className="md:hidden flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt={navbar.name} className="h-8 object-contain" />
          </Link>

          {/* Right-side Icons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="text-neutral-700 hover:text-primary transition"
            >
              <ShoppingCart size={20} />
            </Link>

            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              className="text-neutral-700 hover:text-primary transition"
            >
              <User size={20} />
            </Link>
            <button
              className="text-neutral-700 hover:text-primary transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt={navbar.name}
              className="w-45 h-10 object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {navbar?.items.map((item) => {
                  if (item.name === "Tailoring") {
                    return (
                      <NavigationMenuItem key={item.name}>
                        <Link
                          href="/tailoring"
                          className="text-neutral-700 hover:text-primary transition-all font-medium text-sm tracking-wide px-3 py-2 block"
                        >
                          {item.name}
                        </Link>
                      </NavigationMenuItem>
                    );
                  } else if (item.submenu) {
                    return (
                      <NavigationMenuItem key={item.name}>
                        <NavigationMenuTrigger className="text-neutral-700 hover:text-primary bg-transparent">
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-[400px] p-4 md:grid md:grid-cols-2 gap-3">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block text-sm p-3 rounded-md hover:bg-primary hover:text-white transition-colors"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  }
                  return (
                    <NavigationMenuItem key={item.name}>
                      <Link
                        href={item.href}
                        className="text-neutral-700 hover:text-primary transition-all font-medium text-sm tracking-wide px-3 py-2 block"
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right-side Icons */}
          {/* Right-side Icons */}
          <div className="flex items-center space-x-4">
            {
              <>
                <Link
                  href="/cart"
                  className="text-neutral-700 hover:text-primary transition"
                >
                  <ShoppingCart size={22} />
                </Link>
                <Link
                  href={isAuthenticated ? "/profile" : "/login"}
                  className="text-neutral-700 hover:text-primary transition"
                >
                  <User size={22} />
                </Link>
              </>
            }
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 bg-white shadow-inner p-4 overflow-x-hidden">
          <div className="flex flex-col space-y-3">
            {navbar?.items.map((item) => (
              <div key={item.name}>
                {item.name === "Tailoring" ? (
                  <Link
                    href="/tailoring"
                    className="block py-2 px-3 text-neutral-800 font-medium rounded-md hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : item.submenu ? (
                  <div className="space-y-2">
                    <div className="font-medium text-neutral-800 py-2 px-3">
                      {item.name}
                    </div>
                    <div className="pl-3 space-y-1 border-l-2 border-primary">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block py-1.5 px-3 text-sm text-neutral-700 hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 px-3 text-neutral-800 font-medium rounded-md hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
