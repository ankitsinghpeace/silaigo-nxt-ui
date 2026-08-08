"use client";
import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import HeroEditor from "@/components/admin/editors/HeroEditor";
import JourneyEditor from "@/components/admin/editors/JourneyEditor";
import TestimonialsEditor from "@/components/admin/editors/TestimonialsEditor";
import VideosEditor from "@/components/admin/editors/VideosEditor";
import PartnersEditor from "@/components/admin/editors/PartnersEditor";
import AchievementsEditor from "@/components/admin/editors/AchievementsEditor";
import { toast } from "@/hooks/use-toast";
import { fetchPageSectionData } from "@/services";
import FnQEditor from "@/components/admin/editors/FnQEditor";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionSubType, PermissionType } from "@/types/enums";

const LandingEditor = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const [hasChanges, setHasChanges] = useState(false);
  const [data, setData] = useState<any>({});
  const { user } = useAuth();
  const contentPermissions = {
    edit: user?.permissions.includes(
      `${PermissionType.CONTENT}.${PermissionSubType.EDIT}`,
    ),
    view: user?.permissions.includes(
      `${PermissionType.CONTENT}.${PermissionSubType.VIEW}`,
    ),
    create: user?.permissions.includes(
      `${PermissionType.CONTENT}.${PermissionSubType.CREATE}`,
    ),
    delete: user?.permissions.includes(
      `${PermissionType.CONTENT}.${PermissionSubType.DELETE}`,
    ),
  };

  const modifiedDataRef = useRef<any>({});

  const handleSectionChange = (key: string, sectionData: any) => {
    modifiedDataRef.current[key] = sectionData;
    setHasChanges(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          heroRes,
          journeyRes,
          testimonialsRes,
          partnersRes,
          achievementsRes,
          videosRes,
          fnqRes,
        ] = await Promise.all([
          fetchPageSectionData("hero", { isEditPage: true }),
          fetchPageSectionData("journey", { isEditPage: true }),
          fetchPageSectionData("testimonials", { isEditPage: true }),
          fetchPageSectionData("partners", { isEditPage: true }),
          fetchPageSectionData("achievements", { isEditPage: true }),
          fetchPageSectionData("videos", { isEditPage: true }),
          fetchPageSectionData("fnq", { isEditPage: true }),
        ]);

        setData({
          sectionHero: heroRes?.hero || [],
          sectionJourney: journeyRes || [],
          sectionTestimonials: testimonialsRes.testimonials || [],
          sectionPartners: partnersRes.partners || [],
          sectionAchievements: achievementsRes.achievements || [],
          sectionVideos: videosRes.videos || [],
          sectionFnQ: fnqRes.fnq || [],
        });
      } catch (error) {
        toast({
          title: "Failed to load data",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="sm:items-center sm:justify-between py-20 pb-5">
        <div className="animate-fade-in">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Landing Page Editor
          </h2>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full animate-fade-in"
      >
        <TabsList className="mb-6 flex overflow-x-auto space-x-1 pb-px scrollbar-none">
          <TabsTrigger
            value="hero"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Hero
          </TabsTrigger>
          <TabsTrigger
            value="journey"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Journey
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="partners"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Partners
          </TabsTrigger>
          <TabsTrigger
            value="testimonials"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Testimonials
          </TabsTrigger>
          <TabsTrigger
            value="fnq"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            FAQ
          </TabsTrigger>
        </TabsList>

        <Card className="shadow-md border-border/40 animate-scale-in rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <TabsContent value="hero" className="animate-slide-in mt-0">
              {data.sectionHero && (
                <HeroEditor
                  hero={data.sectionHero}
                  onChange={(hero) => handleSectionChange("hero", { hero })}
                  contentPermissions={contentPermissions}
                />
              )}
            </TabsContent>

            <TabsContent value="journey" className="animate-slide-in mt-0">
              {data.sectionJourney && (
                <JourneyEditor
                  journey={data.sectionJourney}
                  onChange={(data) => handleSectionChange("journey", data)}
                  contentPermissions={contentPermissions}
                />
              )}
            </TabsContent>

            <TabsContent value="achievements" className="animate-slide-in mt-0">
              <AchievementsEditor
                achievements={data.sectionAchievements}
                onChange={(data) => handleSectionChange("achievements", data)}
                contentPermissions={contentPermissions}
              />
            </TabsContent>

            <TabsContent value="videos" className="animate-slide-in mt-0">
              <VideosEditor
                videos={data.sectionVideos}
                onChange={(data) => handleSectionChange("videos", data)}
                contentPermissions={contentPermissions}
              />
            </TabsContent>

            <TabsContent value="partners" className="animate-slide-in mt-0">
              <PartnersEditor
                onChange={(data) => handleSectionChange("partners", data)}
                initialPartners={data.sectionPartners}
                contentPermissions={contentPermissions}
              />
            </TabsContent>

            <TabsContent value="testimonials" className="animate-slide-in mt-0">
              <TestimonialsEditor
                onChange={(data) => handleSectionChange("testimonials", data)}
                initialTestimonials={data.sectionTestimonials}
                contentPermissions={contentPermissions}
              />
            </TabsContent>

            <TabsContent value="fnq" className="animate-slide-in mt-0">
              <FnQEditor
                onChange={(data) => handleSectionChange("fnq", data)}
                initialFnqs={data.sectionFnQ}
                contentPermissions={contentPermissions}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-20 right-6 z-40 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          <p className="text-sm font-medium">You have unsaved changes</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default LandingEditor;
