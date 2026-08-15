import Link from "next/link";
import { Search, MapPin, Scissors, Ruler, ChevronRight } from "lucide-react";

interface PageInfo {
  slug: string[];
  title: string;
}

interface ExploreListProps {
  allPages: PageInfo[];
  search?: string;
}

export default function ExploreList({
  allPages,
  search = "",
}: ExploreListProps) {
  const normalizedSearch = search.trim().toLowerCase();

  const filteredPages = normalizedSearch
    ? allPages.filter(
        (page) =>
          page.title.toLowerCase().includes(normalizedSearch) ||
          page.slug.join("/").toLowerCase().includes(normalizedSearch),
      )
    : allPages;

  const groups = filteredPages.reduce(
    (acc, page) => {
      let groupName = page.slug.length > 1 ? page.slug[0] : "General";

      groupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);

      if (!acc[groupName]) {
        acc[groupName] = [];
      }

      acc[groupName].push(page);

      return acc;
    },
    {} as Record<string, PageInfo[]>,
  );

  const getIcon = (groupName: string) => {
    switch (groupName.toLowerCase()) {
      case "location":
        return <MapPin className="h-5 w-5" />;

      case "services":
        return <Scissors className="h-5 w-5" />;

      default:
        return <Ruler className="h-5 w-5" />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl py-4">
      {/* Search Bar */}
      <form method="GET" className="relative mx-auto mb-12 max-w-xl">
        <div className="relative flex items-center rounded-xl border border-neutral-sand bg-white px-6 py-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <Search className="mr-4 h-5 w-5 shrink-0 text-neutral-taupe" />

          <input
            type="search"
            name="search"
            placeholder="Search our locations and services..."
            defaultValue={search}
            className="w-full border-none bg-transparent font-sans text-neutral-charcoal placeholder:text-neutral-taupe focus:outline-none"
          />
        </div>
      </form>

      {/* Directory Groups */}
      {Object.keys(groups).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupName, pages]) => (
              <section key={groupName}>
                <div className="mb-6 flex items-center gap-4 border-b border-neutral-sand/50 pb-3">
                  <div className="rounded-xl bg-primary/5 p-2.5 text-primary">
                    {getIcon(groupName)}
                  </div>

                  <div>
                    <h2 className="font-display text-xl font-bold text-neutral-charcoal">
                      {groupName}
                    </h2>

                    <p className="font-sans text-xs uppercase tracking-wide text-neutral-taupe">
                      Browse all {groupName.toLowerCase()} pages
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {pages.map((page) => {
                    const pageTitle =
                      page.title
                        .split("|")[0]
                        .trim()
                        .replace("Silaigo", "")
                        .replace("-", "")
                        .trim() || page.slug[page.slug.length - 1];

                    return (
                      <Link
                        key={page.slug.join("/")}
                        href={`/${page.slug.join("/")}`}
                        className="group flex items-center justify-between rounded-2xl border border-neutral-sand bg-white p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                      >
                        <div className="flex-grow">
                          <h3 className="mb-1 font-sans text-lg font-semibold text-neutral-charcoal transition-colors group-hover:text-primary">
                            {pageTitle}
                          </h3>

                          <div className="flex items-center gap-2 font-sans text-sm text-neutral-taupe">
                            <span className="lowercase opacity-60">
                              {page.slug.join(" / ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-ivory text-neutral-taupe transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-ivory">
            <Search className="h-8 w-8 text-neutral-sand" />
          </div>

          <p className="font-sans italic text-neutral-taupe">
            We couldn&apos;t find any pages matching &quot;{search}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
