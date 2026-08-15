import { INavbar } from "@/types/interface";
import { Menu, ShoppingCart, User, ChevronDown } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  navbar: INavbar;
  isAuthenticated?: boolean;
}

const Navbar = ({ navbar, isAuthenticated = false }: NavbarProps) => {
  return (
    <nav className="sticky left-0 top-0 z-50 w-full bg-white py-3 shadow-md">
      <div className="px-4 sm:px-6 lg:px-12">
        {/* Mobile Header */}
        <div className="flex w-full items-center justify-between md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt={navbar.name}
              className="h-8 object-contain"
              width={120}
              height={32}
            />
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="text-neutral-700 transition hover:text-primary"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
            </Link>

            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              className="text-neutral-700 transition hover:text-primary"
              aria-label={isAuthenticated ? "Profile" : "Login"}
            >
              <User size={20} />
            </Link>

            <details className="relative">
              <summary
                className="flex cursor-pointer list-none items-center text-neutral-700 transition hover:text-primary [&::-webkit-details-marker]:hidden"
                aria-label="Open navigation menu"
              >
                <Menu size={22} />
              </summary>

              <div className="absolute right-[-1rem] top-10 w-screen max-w-sm overflow-hidden border-t border-gray-100 bg-white shadow-lg">
                <div className="flex flex-col space-y-3 p-4">
                  {navbar?.items?.map((item) => (
                    <div key={item.name}>
                      {item.name === "Tailoring" ? (
                        <Link
                          href="/tailoring"
                          className="block rounded-md px-3 py-2 font-medium text-neutral-800 hover:bg-gray-100"
                        >
                          {item.name}
                        </Link>
                      ) : item.submenu?.length ? (
                        <details>
                          <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 font-medium text-neutral-800 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
                            <span>{item.name}</span>
                            <ChevronDown className="h-4 w-4" />
                          </summary>

                          <div className="ml-3 mt-2 space-y-1 border-l-2 border-primary pl-3">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block px-3 py-1.5 text-sm text-neutral-700 hover:text-primary"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <Link
                          href={item.href}
                          className="block rounded-md px-3 py-2 font-medium text-neutral-800 hover:bg-gray-100"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden items-center justify-between md:flex">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt={navbar.name}
              className="h-10 w-[180px] object-contain"
              width={180}
              height={40}
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <nav aria-label="Main navigation">
              <ul className="flex items-center">
                {navbar?.items?.map((item) => {
                  if (item.name === "Tailoring") {
                    return (
                      <li key={item.name}>
                        <Link
                          href="/tailoring"
                          className="block px-3 py-2 text-sm font-medium tracking-wide text-neutral-700 transition-all hover:text-primary"
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  }

                  if (item.submenu?.length) {
                    return (
                      <li key={item.name} className="group relative">
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-wide text-neutral-700 transition-all hover:text-primary"
                        >
                          {item.name}
                          <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                        </button>

                        <div className="invisible absolute left-1/2 top-full z-50 w-[400px] -translate-x-1/2 translate-y-2 rounded-lg border border-gray-100 bg-white p-4 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="grid grid-cols-2 gap-3">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block rounded-md p-3 text-sm text-neutral-700 transition-colors hover:bg-primary hover:text-white"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="block px-3 py-2 text-sm font-medium tracking-wide text-neutral-700 transition-all hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="text-neutral-700 transition hover:text-primary"
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
            </Link>

            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              className="text-neutral-700 transition hover:text-primary"
              aria-label={isAuthenticated ? "Profile" : "Login"}
            >
              <User size={22} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
