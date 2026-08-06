"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { fetchNavbarData } from "@/services";
import { INavbar } from "@/types/interface";

interface LayoutProps {
  children: ReactNode;
}

const WHATSAPP_URL = "https://wa.me/918800633755";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isCustomizePage =
    !!pathname &&
    pathname.includes("/category/") &&
    pathname.includes("/style/") &&
    pathname.includes("/customize");

  const isAdminPage = !!pathname && pathname.includes("/admin");

  // Shared, cached across the app — fetched once per session.
  const { data: navbarData } = useQuery<INavbar | null>({
    queryKey: ["navbar"],
    queryFn: async () => {
      try {
        return (await fetchNavbarData()) as INavbar;
      } catch (err) {
        console.error("Navbar fetch failed", err);
        return null;
      }
    },
    enabled: !isCustomizePage,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });


  return (
    <main className="relative flex-1">
      {navbarData && !isCustomizePage && <Navbar navbar={navbarData} />}

      {children}

      {!isCustomizePage && !isAdminPage && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Chat on WhatsApp"
          >
            <FaWhatsapp className="w-6 h-6" />
          </a>

          <a
            href="tel:+918800633755"
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Call Us"
          >
            <FaPhoneAlt className="w-6 h-6" />
          </a>
        </div>
      )}

      {!isCustomizePage && <Footer />}
    </main>
  );
};

export default Layout;
