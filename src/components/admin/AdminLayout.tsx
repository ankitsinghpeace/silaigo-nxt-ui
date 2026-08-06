"use client";
import React, { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full md:translate-x-0 md:w-20"
        }`}
      >
        <AdminSidebar isCollapsed={!sidebarOpen && !isMobile} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar toggle */}
      <div className="hidden md:block absolute left-0 top-4 z-40 ml-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${
              !sidebarOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarOpen ? "md:ml-0" : "md:ml-0"
        } pb-16`}
      >
        <main className="p-6 animate-fade-in max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
