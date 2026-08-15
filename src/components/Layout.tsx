import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component.
 * 
 * NOTE: Navbar and Footer are now handled in RootLayout.
 * This component is now a simple wrapper for backward compatibility.
 * It can be removed once all direct imports are updated.
 */
const Layout = ({ children }: LayoutProps) => {
  return <main className="relative flex-1">{children}</main>;
};

export default Layout;
