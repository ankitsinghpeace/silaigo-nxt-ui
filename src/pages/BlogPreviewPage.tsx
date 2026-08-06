import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/lib/next-router-compat";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  Tag,
  BookOpen,
  User,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import "../blog-quill-content.css";
import { SafeHTMLRenderer } from "@/components/SafeHTMLRenderer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBlogReaction, getBlogBySlug } from "@/services/modules/blogs.api";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { BlogReactionType } from "@/types/enums";
import { format } from "date-fns";
import { getCategoryName } from "./BlogPage";
import { FaUser } from "react-icons/fa";
import { IBlog } from "@/types/interface";

export const reactionTypes = [
  {
    type: BlogReactionType.LIKE,
    icon: <ThumbsUp className="h-4 w-4" />,
    color: "bg-blue-500 text-white",
  },
  {
    type: BlogReactionType.DISLIKE,
    icon: <ThumbsDown className="h-4 w-4" />,
    color: "bg-red-500 text-white",
  },
  {
    type: BlogReactionType.LOVE,
    icon: <Heart className="h-4 w-4" />,
    color: "bg-pink-500 text-white",
  },
  {
    type: BlogReactionType.LAUGH,
    icon: <Laugh className="h-4 w-4" />,
    color: "bg-yellow-500 text-white",
  },
  {
    type: BlogReactionType.ANGRY,
    icon: <Angry className="h-4 w-4" />,
    color: "bg-orange-500 text-white",
  },
  {
    type: BlogReactionType.SAD,
    icon: <Frown className="h-4 w-4" />,
    color: "bg-purple-500 text-white",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as any,
    },
  },
};

function getReadingTime(html: string): string {
  if (!html) return "1 min read";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = text.trim().split(" ").length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

const BlogPreviewPage = ({
  previewBlog,
  isPreview,
  slug: slugProp,
}: {
  previewBlog?: any;
  isPreview?: boolean;
  slug?: string;
}) => {
  const router = useRouter();
  const slug = slugProp ?? router.query.slug;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clickedReaction, setClickedReaction] =
    useState<BlogReactionType | null>(null);
  const [userReaction, setUserReaction] = useState<BlogReactionType | null>(
    null,
  );
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const {
    data: blog,
    isLoading: isLoadingBlog,
    isError: isErrorBlog,
    refetch: refetchBlog,
  } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      if (isPreview && previewBlog) return previewBlog;
      if (!slug) throw new Error("No blog slug");
      const res = await getBlogBySlug(slug as string);
      return res;
    },
    enabled: !isPreview && !!slug,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const blogData = isPreview && previewBlog ? previewBlog : blog;

  const defaultReactions = [
    { type: BlogReactionType.LIKE, count: 0 },
    { type: BlogReactionType.DISLIKE, count: 0 },
    { type: BlogReactionType.LOVE, count: 0 },
    { type: BlogReactionType.LAUGH, count: 0 },
    { type: BlogReactionType.ANGRY, count: 0 },
    { type: BlogReactionType.SAD, count: 0 },
  ];

  const reactions = blogData?.reactions || defaultReactions;

  const getReactionCount = (type: BlogReactionType) => {
    const reaction = reactions.find((r) => r.type === type);
    return reaction ? reaction.count : 0;
  };

  const shareBlog = useCallback(() => {
    if (!blogData) return;

    const url = `${window.location.origin}/blog/${blogData.slug}`;
    try {
      if (navigator.share) {
        navigator.share({
          title: blogData.title,
          url: url,
        });
      } else {
        navigator.clipboard.writeText(url);
        toast({
          title: "Blog shared",
          description: "Blog link copied to clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    }
  }, [blogData, toast]);

  const { mutate: addBlogReactionMutation, isPending: isAddingReaction } =
    useMutation({
      mutationFn: (reaction: BlogReactionType) =>
        addBlogReaction(blogData.slug, reaction),
      onMutate: async (newReaction: BlogReactionType) => {
        await queryClient.cancelQueries({ queryKey: ["blog", slug] });
        const previousBlog = queryClient.getQueryData(["blog", slug]);

        queryClient.setQueryData(["blog", slug], (old: any) => {
          if (!old) return old;

          const newReactions = [...(old.reactions || defaultReactions)];

          if (userReaction !== null) {
            const prevReactionIndex = newReactions.findIndex(
              (r) => r.type === userReaction,
            );
            if (prevReactionIndex !== -1) {
              newReactions[prevReactionIndex] = {
                ...newReactions[prevReactionIndex],
                count: Math.max(0, newReactions[prevReactionIndex].count - 1),
              };
            }
          }

          if (userReaction !== newReaction) {
            const newReactionIndex = newReactions.findIndex(
              (r) => r.type === newReaction,
            );
            if (newReactionIndex !== -1) {
              newReactions[newReactionIndex] = {
                ...newReactions[newReactionIndex],
                count: newReactions[newReactionIndex].count + 1,
              };
            } else {
              newReactions.push({ type: newReaction, count: 1 });
            }
          }

          return {
            ...old,
            reactions: newReactions,
          };
        });

        setUserReaction(userReaction === newReaction ? null : newReaction);
        return { previousBlog };
      },
      onError: (error, newReaction, context) => {
        if (context?.previousBlog) {
          queryClient.setQueryData(["blog", slug], context.previousBlog);
        }
        setUserReaction(userReaction);
        toast({
          title: "Error",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
      onSuccess: (updatedReactions: any[]) => {
        queryClient.setQueryData(["blog", slug], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            reactions: updatedReactions,
          };
        });

        toast({
          title: "Reaction updated",
          description: "Your reaction has been recorded",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["blog", slug] });
      },
    });

  const handleReaction = (reactionType: BlogReactionType) => {
    if (isAddingReaction) return;

    setClickedReaction(reactionType);
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => setClickedReaction(null), 500);

    addBlogReactionMutation(reactionType);
  };

  if (!blogData && isLoadingBlog) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="text-primary animate-spin mr-2">⏳</span> Loading
        blog...
      </div>
    );
  }

  if (!blogData && isErrorBlog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-red-500 text-4xl mb-2">⚠️</span>
        <p className="text-gray-600 mb-4">Failed to load blog</p>
        <Button onClick={() => refetchBlog()}>Try Again</Button>
      </div>
    );
  }

  if (!blogData) return null;

  const authorName = blogData.author?.firstName
    ? `${blogData.author.firstName} ${blogData.author.lastName || ""}`.trim()
    : typeof blogData.author === "string"
      ? blogData.author
      : "Unknown";
  const readingTime = getReadingTime(blogData.content);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/30 to-white">
      <MetaTagsProvider
        title={`${blogData.title} | SilaiGo Blog`}
        description={
          blogData.content?.replace(/<[^>]+>/g, " ").slice(0, 120) ||
          "Discover expert tailoring insights, fabric explorations, and style inspirations to elevate your fashion journey."
        }
        canonicalPath={`/blog/${blogData.slug}`}
      />

      <motion.section
        className={`relative overflow-hidden ${isPreview ? "h-auto min-h-[50vh]" : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10"></div>
        <motion.img
          src={blogData.featuredImage}
          alt={blogData.title}
          className={`w-full object-cover object-top ${isPreview ? "h-[50vh]" : "h-[70vh]"}`}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" as any }}
        />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {!isPreview && (
                <motion.div variants={itemVariants}>
                  <Link
                    href="/blog"
                    className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-all duration-300 hover:translate-x-[-4px] group"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
                    Back to Blog
                  </Link>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <Badge className="mb-6 bg-primary/90 backdrop-blur-sm border-0 text-white hover:bg-primary transition-all duration-300">
                  <Tag className="mr-1 h-3 w-3" />
                  {getCategoryName(blogData.category)}
                </Badge>
              </motion.div>

              <motion.h1
                className={`font-playfair font-medium text-white mb-6 leading-tight ${isPreview ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl lg:text-6xl"}`}
                variants={itemVariants}
              >
                {blogData.title}
              </motion.h1>

              <motion.div
                className="flex flex-wrap  text-white/90 text-sm gap-4"
                variants={itemVariants}
              >
                <div className="flex gap-2 flex-wrap">
                  <FaUser className="h-4 w-4" />
                  <span className="font-medium">{authorName}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Calendar className="h-4 w-4" />
                  {format(blogData.updatedAt, "MMM d, yyyy")}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Clock className="h-4 w-4" />
                  {readingTime}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="mb-8 p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center justify-center flex-wrap gap-2">
                    {reactionTypes.map((reaction) => {
                      const isSelected = userReaction === reaction.type;
                      const count = getReactionCount(reaction.type);
                      const shadowColor =
                        reaction.type === BlogReactionType.LIKE
                          ? "0 0 0 4px rgba(59,130,246,0.25)"
                          : reaction.type === BlogReactionType.DISLIKE
                            ? "0 0 0 4px rgba(239,68,68,0.25)"
                            : reaction.type === BlogReactionType.LOVE
                              ? "0 0 0 4px rgba(236,72,153,0.25)"
                              : reaction.type === BlogReactionType.LAUGH
                                ? "0 0 0 4px rgba(253,224,71,0.25)"
                                : reaction.type === BlogReactionType.ANGRY
                                  ? "0 0 0 4px rgba(251,146,60,0.25)"
                                  : reaction.type === BlogReactionType.SAD
                                    ? "0 0 0 4px rgba(168,85,247,0.25)"
                                    : "0 0 0 4px rgba(0,0,0,0.10)";

                      return (
                        <motion.div
                          key={reaction.type}
                          whileHover={{
                            scale: 1.12,
                            boxShadow: `${shadowColor}`,
                          }}
                          whileTap={{ scale: 0.95 }}
                          animate={
                            isSelected
                              ? { scale: 1.08, boxShadow: `${shadowColor}` }
                              : { scale: 1, boxShadow: "none" }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          style={{ borderRadius: 9999 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(reaction.type)}
                            disabled={isAddingReaction}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${reaction.color} ${isSelected ? "ring-4 ring-offset-2" : ""} ${isAddingReaction ? "opacity-50 cursor-not-allowed" : ""}`}
                            style={{
                              backgroundColor: undefined,
                              boxShadow: isSelected ? shadowColor : undefined,
                            }}
                          >
                            <motion.div
                              animate={
                                clickedReaction === reaction.type
                                  ? {
                                      scale: [1, 1.3, 0.95, 1],
                                      rotate: [0, -10, 10, 0],
                                    }
                                  : { scale: 1, rotate: 0 }
                              }
                              transition={{
                                duration: 0.5,
                                times: [0, 0.3, 0.7, 1],
                              }}
                            >
                              {reaction.icon}
                            </motion.div>
                            <span className="font-medium">{count}</span>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                        onClick={shareBlog}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0">
                <CardContent className="p-8 md:p-12">
                  <SafeHTMLRenderer content={blogData.content} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default BlogPreviewPage;
