"use client";
import React, { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import BlogPreviewPage from "@/pages/BlogPreviewPage";
import { useMutation } from "@tanstack/react-query";
import { createBlog, updateBlog } from "@/services/modules/blogs.api";
import { IBlog } from "@/types/interface";
import { generateErrorMessage } from "@/lib/helpers";
import { categories, MOCK_DATA } from "./AddNewBlog";
import ImagePreview from "../ImagePreview";
import ReactQuillEditor from "../ReactQuillEditor";

type EditBlog = Partial<IBlog>;

export default function EditExistingBlog({
  existingBlog,
  closeDialog,
}: {
  existingBlog: IBlog;
  closeDialog: () => void;
}) {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const { toast } = useToast();
  const [blog, setBlog] = useState<EditBlog>(existingBlog);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<any>();

  const handleImageSelect = (url: string) => {
    setBlog({ ...blog, featuredImage: url });
  };

  const showPreview = () => {
    setPreviewBlog({ ...blog, ...MOCK_DATA });
    setIsPreviewOpen(true);
  };

  const { mutate: updateBlogMutation, isPending: isUpdatingBlog } = useMutation(
    {
      mutationFn: (blog: Partial<IBlog>) => updateBlog(existingBlog.slug, blog),
      onSuccess: () => {
        toast({
          title: "Blog updated successfully",
        });
        closeDialog();
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: "Error updating blog",
          description: generateErrorMessage(error),
          variant: "destructive",
        });
      },
    },
  );

  const handleSaveDraft = async () => {
    updateBlogMutation({ ...blog, isPublished: false });
  };

  useEffect(() => {
    setBlog(existingBlog);
  }, [existingBlog]);

  return (
    <div className="w-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit New Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              updateBlogMutation({ ...blog, isPublished: true });
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
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImagePickerOpen(true)}
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

            <div className="space-y-2 relative h-[500px]">
              <Label>Content</Label>
              <ReactQuillEditor
                value={blog.content}
                onChange={(value) => setBlog({ ...blog, content: value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={showPreview}>
                Show Preview
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                disabled={isUpdatingBlog}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isUpdatingBlog}
                className="underline"
              >
                {isUpdatingBlog ? "Saving..." : "Save Draft"}
              </Button>
              <Button disabled={isUpdatingBlog} type="submit">
                {isUpdatingBlog ? "Updating..." : "Update Blog"}
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
