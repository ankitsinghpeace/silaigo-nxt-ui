"use client";
import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  fetchAllCategories,
  fetchCategoryTypeData,
  getCustomizationData,
  getCustomizationMapping,
} from "@/services";
import CategoriesEditor from "@/components/admin/editors/CategoriesEditor";
import CustomizationsEditor from "@/components/admin/editors/CustomizationsEditor";
import { CustomizationsMapping } from "@/components/admin/editors/CustomizatonsOptionMappingEditor";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionSubType, PermissionType } from "@/types/enums";

const InventoryPageEditor = () => {
  const [activeTab, setActiveTab] = useState("category");
  const [hasChanges, setHasChanges] = useState(false);
  const [data, setData] = useState<any>({});
  const modifiedDataRef = useRef<any>({});
  const hasFetched = useRef(false);
  const { user } = useAuth();
  const inventoryPermissions = {
    edit:
      user?.permissions.includes(
        `${PermissionType.INVENTORY}.${PermissionSubType.EDIT}`,
      ) || false,
    view:
      user?.permissions.includes(
        `${PermissionType.INVENTORY}.${PermissionSubType.VIEW}`,
      ) || false,
    create:
      user?.permissions.includes(
        `${PermissionType.INVENTORY}.${PermissionSubType.CREATE}`,
      ) || false,
    delete:
      user?.permissions.includes(
        `${PermissionType.INVENTORY}.${PermissionSubType.DELETE}`,
      ) || false,
  };

  const handleSectionChange = (key: string, sectionData: any) => {
    modifiedDataRef.current[key] = sectionData;
    setHasChanges(true);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const [categoriesRes, customisationsRes, customisationsMappingRes] =
          await Promise.all([
            fetchAllCategories(),
            getCustomizationData(),
            getCustomizationMapping(),
          ]);

        setData({
          categories: categoriesRes || [],
          customisations: customisationsRes || [],
          customisationsMapping: customisationsMappingRes || [],
        });
      } catch (error) {
        toast({
          title: "Failed to load data",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  if (!data.categories || !data.categories.length) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="sm:items-center sm:justify-between py-20 pb-5">
        <div className="animate-fade-in">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Category Page Editor
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
            value="category"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Category
          </TabsTrigger>
          <TabsTrigger
            value="customisations"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Customisations
          </TabsTrigger>
          <TabsTrigger
            value="customisations-mapping"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
          >
            Customisations Mapping
          </TabsTrigger>
        </TabsList>

        <Card className="shadow-md border-border/40 animate-scale-in rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <TabsContent value="category" className="animate-slide-in mt-0">
              <CategoriesEditor
                categories={data.categories}
                inventoryPermission={inventoryPermissions}
              />
            </TabsContent>

            <TabsContent
              value="customisations"
              className="animate-slide-in mt-0"
            >
              <CustomizationsEditor
                customizations={data.customisations}
                onChange={(customisations) =>
                  handleSectionChange("customisations", { customisations })
                }
                inventoryPermission={inventoryPermissions}
              />
            </TabsContent>

            <TabsContent
              value="customisations-mapping"
              className="animate-slide-in mt-0"
            >
              <CustomizationsMapping
                categories={data.categories}
                mappingList={data.customisationsMapping}
                inventoryPermission={inventoryPermissions}
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

export default InventoryPageEditor;
