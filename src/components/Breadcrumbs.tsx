import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; href: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items?.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full border-b border-border/60 bg-background/80"
    >
      <ol className="section-container flex flex-wrap items-center gap-1 py-4 text-sm font-montserrat text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-neutral-charcoal"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
