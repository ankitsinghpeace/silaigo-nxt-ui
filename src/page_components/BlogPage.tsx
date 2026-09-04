"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  FileText,
  Scissors,
  Tag,
  TrendingUp,
  Loader2,
  AlertCircle,
  icons,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "@/services/modules/blogs.api";
import { BlogListResponse } from "@/types/interface";
import { format } from "date-fns";
import { reactionTypes } from "./BlogPreviewPage";
import { useRouter } from "@/lib/next-router-compat";

export const categories = [
  {
    id: "fabric_explorations",
    name: "Fabric Explorations",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    id: "tailoring_expertise",
    name: "Tailoring Expertise",
    icon: <Scissors className="h-4 w-4" />,
  },
  {
    id: "fashion_trends",
    name: "Fashion Trends",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: "style_guides",
    name: "Style Guides",
    icon: <FileText className="h-4 w-4" />,
  },
];

export const getCategoryName = (id: string) => {
  const category = categories.find((cat) => cat.id === id);
  return category ? category.name : id;
};
export const getCategoryIcon = (id: string) => {
  const category = categories.find((cat) => cat.id === id);
  return category ? category.icon : <Tag className="h-4 w-4" />;
};

const BlogPage = () => {
  const router = useRouter();
  const searchParams = router.query;
  const setSearchParams = (params: Record<string, string>) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...params,
      },
    });
  };

  const selectedCategory = searchParams.category || "";
  const search = searchParams.title || "";
  const page = parseInt(searchParams.page || "1", 10);
  const queryString = new URLSearchParams(
    searchParams as Record<string, string>,
  ).toString();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<BlogListResponse>({
      queryKey: ["blogs", queryString],
      queryFn: async () => {
        return await getBlogs(searchParams);
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  const handleCategoryClick = (catId: string) => {
    if (searchParams.category === catId) {
      const newQuery = { ...router.query };
      delete newQuery.category;
      newQuery.page = "1";
      router.push({ pathname: router.pathname, query: newQuery });
    } else {
      setSearchParams({ category: catId, page: "1" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("search") as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      setSearchParams({ title: value, page: "1" });
    } else {
      const newQuery = { ...router.query };
      delete newQuery.title;
      newQuery.page = "1";
      router.push({ pathname: router.pathname, query: newQuery });
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  const blogs = data?.blogs || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col">
      <MetaTagsProvider
        title="Blog | SilaiGo"
        description="Discover expert tailoring insights, fabric explorations, and style inspirations to elevate your fashion journey."
        canonicalPath="/blog"
      />

      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif text-center font-medium text-gray-900 mb-4">
            Silai Go Blog
          </h1>
          <p className="text-lg text-center max-w-2xl mx-auto text-gray-600 mb-8">
            Discover expert tailoring insights, fabric explorations, and style
            inspirations to elevate your fashion journey.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4 mb-4"
          >
            <input
              type="text"
              name="search"
              placeholder="Search by title..."
              defaultValue={search}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[220px]"
            />
            <Button
              type="submit"
              disabled={isFetching}
              className="min-w-[120px]"
            >
              {isFetching ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                className={`px-4 py-2 cursor-pointer transition-colors ${selectedCategory === category.id ? "bg-primary text-white" : "hover:bg-primary hover:text-white"}`}
                onClick={() => handleCategoryClick(category.id)}
                style={{ userSelect: "none" }}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">Failed to load blogs</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No blogs found</p>
        </div>
      ) : (
        <>
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-serif font-medium mb-10 text-center">
                Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {blogs.map((post) => (
                  <Card
                    key={post._id}
                    className="overflow-hidden group hover-card"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-full w-full object-cover  object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary">
                        {getCategoryIcon(post.category)}
                        <span className="ml-1">
                          {getCategoryName(post.category)}
                        </span>
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span className="font-medium">
                            {format(post.updatedAt, "MMM d, yyyy")}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3 text-green-500" />
                            <ThumbsDown className="h-3 w-3 text-red-500" />
                          </div>
                          <span className="font-medium text-gray-700">
                            {post.reactions.length}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {post.content.replace(/<[^>]+>/g, "").slice(0, 120)}...
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        asChild
                      >
                        <Link href={`/blog/${post.slug}`}>Read More</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              {pagination && (
                <div className="text-center mt-12 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage <= 1 || isFetching}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNextPage || isFetching}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="p-8 md:p-12 bg-white rounded-xl shadow-sm text-center">
            <h3 className="text-2xl font-serif font-medium mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-600 mb-6">
              Stay updated with the latest fashion trends, fabric insights, and
              tailoring tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
