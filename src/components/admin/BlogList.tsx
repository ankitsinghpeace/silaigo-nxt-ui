"use client";
import React, { useRef, useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  FileText,
  Scissors,
  Tag,
  TrendingUp,
  Loader2,
  AlertCircle,
  Pencil,
  Trash,
  RefreshCcw,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteBlog, getBlogsListAdmin } from "@/services/modules/blogs.api";
import { BlogListResponse, IBlog } from "@/types/interface";
import { format } from "date-fns";
import { categories, getCategoryIcon, getCategoryName } from "@/pages/BlogPage";
import { Dialog, DialogContent } from "../ui/dialog";
import EditExistingBlog from "./editors/EditExistingBlog";
import { generateErrorMessage } from "@/lib/helpers";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionSubType, PermissionType } from "@/types/enums";
import { useRouter } from "@/lib/next-router-compat";

const BlogList = () => {
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);
  const selectedCategory = searchParams.category || "";
  const search = searchParams.title || "";
  const page = parseInt(searchParams.page || "1", 10);
  const { toast } = useToast();
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const canEdit = user?.permissions?.includes(
    `${PermissionType.CONTENT}.${PermissionSubType.EDIT}`,
  );
  const canDelete = user?.permissions?.includes(
    `${PermissionType.CONTENT}.${PermissionSubType.DELETE}`,
  );
  const canView = user?.permissions?.includes(
    `${PermissionType.CONTENT}.${PermissionSubType.VIEW}`,
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<BlogListResponse>({
      queryKey: ["blogs", searchParams.toString()],
      queryFn: async () => {
        if (!canView) {
          return Promise.reject(
            new Error("You don't have permission to view blogs"),
          );
        }
        return await getBlogsListAdmin(
          searchParams,
        );
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

  const { mutate: deleteBlogMutation, isPending: isDeletingBlog } = useMutation(
    {
      mutationFn: (slug: string) => deleteBlog(slug),
      onSuccess: () => {
        refetch();
        toast({
          title: "Blog deleted successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error deleting blog",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    },
  );

  useEffect(() => {
    if (isEditDialogOpen && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isEditDialogOpen, selectedBlog]);

  return (
    <div className="min-h-screen flex flex-col">
      <MetaTagsProvider
        title="Blog | SilaiGo"
        description="Discover expert tailoring insights, fabric explorations, and style inspirations to elevate your fashion journey."
      />

      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header with title and refresh */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Blog Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage and organize your blog articles
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {/* Search and filters */}
            <div className="space-y-4">
              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search blogs by title..."
                    defaultValue={search}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                  />
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button
                  type="submit"
                  disabled={isFetching}
                  size="sm"
                  className="px-6"
                >
                  {isFetching ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </form>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Filter by:
                </span>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                    className={`px-3 py-1 cursor-pointer transition-all duration-200 text-sm ${
                      selectedCategory === category.id
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-primary/10 hover:border-primary/30"
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                    style={{ userSelect: "none" }}
                  >
                    <span className="mr-1.5">{category.icon}</span>
                    {category.name}
                  </Badge>
                ))}
              </div>

              {/* Active filters display */}
              {(search || selectedCategory) && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {search && (
                    <Badge variant="secondary" className="text-sm">
                      Search: "{search}"
                      <button
                        onClick={() => {
                          const newQuery = { ...router.query };
                          delete newQuery.title;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="text-sm">
                      Category:{" "}
                      {categories.find((c) => c.id === selectedCategory)?.name}
                      <button
                        onClick={() => handleCategoryClick(selectedCategory)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {(search || selectedCategory) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newQuery: Record<string, string> = { page: "1" };
                        router.push({ pathname: router.pathname, query: newQuery });
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}
            </div>
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
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Articles ({blogs.length})
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {pagination &&
                        `Showing page ${pagination.currentPage} of ${pagination.totalPages}`}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold w-20">
                            Image
                          </TableHead>
                          <TableHead className="font-semibold">Title</TableHead>
                          <TableHead className="font-semibold hidden md:table-cell">
                            Category
                          </TableHead>
                          <TableHead className="font-semibold hidden sm:table-cell">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold hidden lg:table-cell">
                            Date
                          </TableHead>
                          <TableHead className="font-semibold text-center w-32">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogs.map((post) => (
                          <TableRow
                            key={post._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="w-20">
                              <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 text-sm sm:text-base">
                                  {post.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 hidden sm:block">
                                  {post.content
                                    .replace(/<[^>]+>/g, "")
                                    .slice(0, 80)}
                                  ...
                                </p>
                                <div className="flex items-center gap-2 mt-1 sm:hidden">
                                  <Badge
                                    variant="outline"
                                    className="text-xs flex items-center gap-1"
                                  >
                                    {getCategoryIcon(post.category)}
                                    <span>
                                      {getCategoryName(post.category)}
                                    </span>
                                  </Badge>
                                  {post.isPublished ? (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-green-600"
                                    >
                                      Published
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-red-600"
                                    >
                                      Draft
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 w-fit"
                              >
                                {getCategoryIcon(post.category)}
                                <span>{getCategoryName(post.category)}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {post.isPublished ? (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-200 bg-green-50"
                                >
                                  Published
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-red-600 border-red-200 bg-red-50"
                                >
                                  Draft
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(post.updatedAt, "MMM d, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 sm:p-2"
                                  asChild
                                >
                                  <Link
                                    target="_blank"
                                    href={`/blog/${post.slug}`}
                                  >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary/80 hover:bg-primary/10 p-1 sm:p-2"
                                  onClick={() => {
                                    setSelectedBlog(post);
                                    setIsEditDialogOpen(true);
                                  }}
                                  disabled={!canEdit}
                                >
                                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2"
                                  onClick={() => {
                                    deleteBlogMutation(post.slug);
                                  }}
                                  disabled={isDeletingBlog || !canDelete}
                                >
                                  {isDeletingBlog ? (
                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                  ) : (
                                    <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {pagination && (
                  <div className="text-center mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={pagination.currentPage <= 1 || isFetching}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={!pagination.hasNextPage || isFetching}
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[calc(100%-100px)] h-[calc(100%-150px)] max-w-full max-h-full p-10 overflow-auto">
          <EditExistingBlog existingBlog={selectedBlog} closeDialog={() => setIsEditDialogOpen(false)}/>
        </DialogContent>
      </Dialog> */}

      {isEditDialogOpen && (
        <div ref={editorRef}>
          <EditExistingBlog
            existingBlog={selectedBlog}
            closeDialog={() => {
              setIsEditDialogOpen(false);
              setSelectedBlog(null);
              refetch();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BlogList;
