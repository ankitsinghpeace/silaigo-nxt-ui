"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Scissors, Ruler, ArrowRight, ChevronRight } from "lucide-react";

interface PageInfo {
  slug: string[];
  title: string;
}

export default function ExploreList({ allPages }: { allPages: PageInfo[] }) {
  const [search, setSearch] = useState("");

  const filteredPages = allPages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.join("/").toLowerCase().includes(search.toLowerCase())
  );

  // Group by first segment
  const groups = filteredPages.reduce((acc, page) => {
    let groupName = page.slug.length > 1 ? page.slug[0] : "General";
    
    // Capitalize and clean group name
    groupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
    
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(page);
    return acc;
  }, {} as Record<string, PageInfo[]>);

  const getIcon = (groupName: string) => {
    switch (groupName.toLowerCase()) {
      case "location": return <MapPin className="w-5 h-5" />;
      case "services": return <Scissors className="w-5 h-5" />;
      default: return <Ruler className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Search Bar - Tailoring Style */}
      <div className="relative max-w-xl mx-auto mb-12">
        <div className="relative bg-white border border-neutral-sand rounded-xl flex items-center px-6 py-4 shadow-sm hover:shadow-md transition-shadow duration-300">
          <Search className="w-5 h-5 text-neutral-taupe mr-4" />
          <input
            type="text"
            placeholder="Search our locations and services..."
            className="w-full bg-transparent border-none text-neutral-charcoal placeholder:text-neutral-taupe focus:outline-none font-sans"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Groups */}
      {Object.keys(groups).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, pages]) => (
            <div key={groupName} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-6 pb-3 border-b border-neutral-sand/50">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                  {getIcon(groupName)}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-neutral-charcoal">
                    {groupName}
                  </h2>
                  <p className="text-xs text-neutral-taupe font-sans tracking-wide uppercase">
                    Browse all {groupName.toLowerCase()} pages
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pages.map((page) => (
                  <Link
                    key={page.slug.join("/")}
                    href={`/${page.slug.join("/")}`}
                    className="group flex items-center justify-between p-6 rounded-2xl bg-white border border-neutral-sand hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="flex-grow">
                      <h3 className="text-lg font-sans font-semibold text-neutral-charcoal group-hover:text-primary transition-colors mb-1">
                        {page.title.split("|")[0].trim().replace("Silaigo", "").replace("-", "").trim() || page.slug[page.slug.length - 1]}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-taupe font-sans">
                        <span className="opacity-60 lowercase">
                          {page.slug.join(" / ")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-neutral-ivory flex items-center justify-center text-neutral-taupe group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-neutral-ivory rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-sand" />
          </div>
          <p className="text-neutral-taupe font-sans italic">
            We couldn't find any pages matching "{search}"
          </p>
        </div>
      )}
    </div>
  );
}
