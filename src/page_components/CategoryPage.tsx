"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchAllMetaMaster, fetchSubCategoryData } from "@/services";
import ReferralModal from "@/components/promotions/ReferralModal";
import OfferModal from "@/components/promotions/OfferModal";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import RibbonLabel from "@/components/RibbonLabel";
import { getSeoContent } from "@/lib/getSeoContent";
import { Phone } from "lucide-react";
import { useRouter } from "@/lib/next-router-compat";

type CategoryPageProps = {
  id: string;
};

const CategoryPage = ({ id }: CategoryPageProps) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryId = Number(id);
        setIsLoading(true);
        const subCategoriesData = await fetchSubCategoryData(categoryId);
        const metadata = await fetchAllMetaMaster();
        setMetadata(metadata);
        setSelectedCategory({ ...subCategoriesData });
      } catch (error) {
        setSelectedCategory({
          name: "",
          description: "",
          imageUrl: "",
          styles: [],
        });
        toast({
          title: "Error",
          description: "Failed to load styles. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, toast]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
    if (activeFilter !== filter) {
      toast({
        title: "Filter Applied",
        description: `Showing ${filter} styles`,
      });
    }
  };

  const getFilteredStyles = () => {
    if (!selectedCategory?.styles) return [];
    if (!activeFilter) return selectedCategory.styles;
    return selectedCategory.styles.filter((style: any) =>
      style.name.toLowerCase().includes(activeFilter.toLowerCase()),
    );
  };

  const categoryName = selectedCategory?.name || "Tailoring";

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <h1 style={{ display: "none" }}>
        {getSeoContent(categoryName).h1}
      </h1>
      <MetaTagsProvider
        title={getSeoContent(categoryName).title}
        description={getSeoContent(categoryName).description}
        image={selectedCategory?.imageUrl || selectedCategory?.image}
        keywords={getFilteredStyles()
          .map((style: any) => style.name)
          .join(", ")}
        canonicalPath={`/category/${id}`}
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Festival Season Special"
        description="Get special discount on all festival collection items"
        discount="25% OFF"
        code="FEST25"
      />

      <div className="container mx-auto mt-10 max-w-[1650px] px-4">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg sm:text-3xl md:text-4xl font-bold text-center mb-10"
        >
          {categoryName} Collection
        </motion.h3>

        <div className="grid gap-8 md:grid-cols-2">
          {isLoading || !selectedCategory ? (
            <div className="col-span-full py-16 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-primary font-medium">Loading collection...</p>
            </div>
          ) : (
            getFilteredStyles()
              .sort((a: any, b: any) => a.rank - b.rank)
              .map((style: any, index: number) => (
              <React.Fragment key={`${style.name}-${index}`}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="flex flex-col bg-white shadow-md hover:shadow-xl transition-all rounded-xl overflow-hidden"
                >
                  <Link
                    href={`/category/${id}/style/${style._id}/customize?subCatId=${selectedCategory.subCategoryId}&page=1`}
                  >
                    {/* Main content */}
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Image */}
                      <div className="w-full md:w-1/2 p-2">
                        <div className="aspect-square rounded-xl overflow-hidden relative">
                          <img
                            src={style.image}
                            alt={style.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {style?.label && <RibbonLabel text={style.label} />}
                        </div>
                      </div>

                      {/* Right: Details */}
                      <div className="w-full md:w-1/2 flex flex-col justify-between p-4 space-y-2">
                        <div>
                          <h2 className="text-xl font-semibold text-primary mb-1">
                            {style.name}
                          </h2>
                          {style.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-1">
                              {style.description}
                            </p>
                          )}
                          {style.keyAttributes?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {style.keyAttributes
                                .slice(0, 3)
                                .map((attr, idx) => (
                                  <span
                                    key={`${attr}-${idx}`}
                                    className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full"
                                  >
                                    {attr}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          {(style.price || style.discountedPrice) && (
                            <div className="flex flex-col text-sm text-right">
                              {style.price && style.discountedPrice ? (
                                <>
                                  <span className="line-through text-muted-foreground">
                                    ₹{style.price}
                                  </span>
                                  <span className="text-lg font-bold text-primary">
                                    ₹{style.discountedPrice}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-primary">
                                  ₹{style.price || style.discountedPrice}
                                </span>
                              )}
                            </div>
                          )}
                          <Button className="px-4 py-1 bg-primary text-xs rounded-full shadow hover:bg-primary/90">
                            Customize & Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Call-us Row */}
                  <div className="p-2 flex mt-0">
                    <a
                      href="tel:+918800633755"
                      className="flex items-center text-xs text-green-600 hover:text-green-700 ml-auto mr-7 mb-2"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call us now!
                    </a>
                  </div>
                </motion.div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
