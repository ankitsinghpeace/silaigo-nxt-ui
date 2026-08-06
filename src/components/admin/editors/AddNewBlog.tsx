"use client";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import ImagePickerModal from "../modals/image.picker.modal";
import { useToast } from "../../../hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import BlogPreviewPage from "@/pages/BlogPreviewPage";
import { useMutation } from "@tanstack/react-query";
import { createBlog } from "@/services/modules/blogs.api";
import { IBlog } from "@/types/interface";
import { generateErrorMessage } from "@/lib/helpers";
import ImagePreview from "../ImagePreview";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionSubType, PermissionType } from "@/types/enums";
import ReactQuillEditor from "../ReactQuillEditor";

export const MOCK_DATA = {
  author: {
    _id: "author1",
    name: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
  createdAt: "2025-04-08T10:00:00Z",
  updatedAt: "2025-04-08T10:00:00Z",
  readTime: "6 min",
  views: 2847,
  reactions: [
    { type: "like", count: 142 },
    { type: "love", count: 89 },
    { type: "laugh", count: 23 },
    { type: "sad", count: 5 },
    { type: "angry", count: 2 },
    { type: "dislike", count: 1 },
  ],
};

export const categories = [
  {
    id: "fabric_explorations",
    label: "Fabric Explorations",
    value: "fabric_explorations",
  },
  {
    id: "tailoring_expertise",
    label: "Tailoring Expertise",
    value: "tailoring_expertise",
  },
  {
    id: "fashion_trends",
    label: "Fashion Trends",
    value: "fashion_trends",
  },
  {
    id: "style_guides",
    label: "Style Guides",
    value: "style_guides",
  },
  {
    id: "miscellaneous",
    label: "Miscellaneous",
    value: "miscellaneous",
  },
];

type CreateBlog = Partial<IBlog>;

export default function AddNewBlog() {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const { toast } = useToast();
  const [blog, setBlog] = useState<CreateBlog>({
    title: "",
    category: "",
    content: "",
    featuredImage: "",
    isPublished: false,
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<any>();
  const { user } = useAuth();
  const canCreate = user?.permissions?.includes(
    `${PermissionType.CONTENT}.${PermissionSubType.CREATE}`,
  );

  const handleImageSelect = (url: string) => {
    setBlog({ ...blog, featuredImage: url });
  };

  const showPreview = () => {
    setPreviewBlog({ ...blog, ...MOCK_DATA });
    setIsPreviewOpen(true);
  };

  const { mutate: createBlogMutation, isPending: isCreatingBlog } = useMutation(
    {
      mutationFn: (blog: Partial<IBlog>) => createBlog(blog),
      onSuccess: (blog) => {
        toast({
          title: "Blog created successfully",
        });
        setBlog(blog as CreateBlog);
      },
      onError: (error) => {
        toast({
          title: "Error creating blog",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    },
  );

  const handleSaveDraft = async () => {
    createBlogMutation({ ...blog, isPublished: false });
  };

  return (
    <div className="w-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              createBlogMutation({ ...blog, isPublished: true });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Blog Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter blog title"
                value={blog.title}
                onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={blog.category}
                onValueChange={(value) => setBlog({ ...blog, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Image URL or upload"
                  value={blog.featuredImage}
                  onChange={(e) =>
                    setBlog({ ...blog, featuredImage: e.target.value })
                  }
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImagePickerOpen(true)}
                  disabled={!canCreate}
                >
                  Upload
                </Button>
              </div>
              {blog.featuredImage && (
                <div className="mt-2">
                  <ImagePreview
                    src={blog.featuredImage}
                    alt="Featured"
                    className="h-[400px] w-full object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 h-[500px]">
              <Label>Content</Label>
              <ReactQuillEditor
                value={blog.content}
                onChange={(value) => setBlog({ ...blog, content: value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={showPreview}
                disabled={!canCreate}
              >
                Show Preview
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  /* handle cancel, e.g., reset form or close editor */
                }}
                disabled={isCreatingBlog || !canCreate}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isCreatingBlog || !canCreate}
                className="underline"
              >
                {isCreatingBlog ? "Saving..." : "Save Draft"}
              </Button>
              <Button disabled={isCreatingBlog || !canCreate} type="submit">
                {isCreatingBlog ? "Creating..." : "Publish Blog"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-[calc(100%-100px)] h-full max-w-full max-h-full p-10 overflow-auto">
          <BlogPreviewPage previewBlog={previewBlog} isPreview={true} />
        </DialogContent>
      </Dialog>
      <ImagePickerModal
        open={isImagePickerOpen}
        onOpenChange={setIsImagePickerOpen}
        onImageSelect={handleImageSelect}
        imageInfo={{
          resourceName: "blog",
          resourceId: 1,
        }}
      />
    </div>
  );
}
