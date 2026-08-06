"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import AddNewBlog from "@/components/admin/editors/AddNewBlog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import BlogList from "@/components/admin/BlogList";

export default function BlogsManagementPage() {
  const [activeTab, setActiveTab] = useState("blogs-list");
  return (
    <AdminLayout>
      <div className="sm:items-center sm:justify-between py-20 pb-5">
        <div className="animate-fade-in">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Blog Page Editor
          </h2>
          <p className="text-sm text-muted-foreground">
            Edit the blog page content and settings.
          </p>
          <div className="mt-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full animate-fade-in"
            >
              <TabsList className="mb-6 flex overflow-x-auto space-x-1 pb-px scrollbar-none">
                <TabsTrigger
                  value="blogs-list"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                >
                  Blogs List
                </TabsTrigger>
                <TabsTrigger
                  value="add-blog"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                >
                  Add New Blog
                </TabsTrigger>
              </TabsList>

              <Card className="shadow-md border-border/40 animate-scale-in rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <TabsContent
                    value="blogs-list"
                    className="animate-slide-in mt-0"
                  >
                    <BlogList />
                  </TabsContent>

                  <TabsContent
                    value="add-blog"
                    className="animate-slide-in mt-0"
                  >
                    <AddNewBlog />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
