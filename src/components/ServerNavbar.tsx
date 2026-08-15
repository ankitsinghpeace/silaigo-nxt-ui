/**
 * ServerNavbar - Server Component that fetches navbar data.
 * 
 * This component fetches navbar data on the server with proper caching
 * and passes it to the presentational Navbar component.
 */

import { getNavbarData } from "@/lib/server-data";
import { INavbar } from "@/types/interface";
import Navbar from "./Navbar";

interface ServerNavbarProps {
  isAuthenticated?: boolean;
}

export default async function ServerNavbar({ isAuthenticated = false }: ServerNavbarProps) {
  let navbarData: INavbar | null = null;

  try {
    navbarData = await getNavbarData();
  } catch (error) {
    console.error("ServerNavbar: Failed to fetch navbar data", error);
  }

  if (!navbarData) {
    // Return null or a fallback navbar if data fetch fails
    return null;
  }

  return <Navbar navbar={navbarData} isAuthenticated={isAuthenticated} />;
}