"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { fetchCategoryById } from "@/services";
import { useRouter } from "@/lib/next-router-compat";

const CategoryById = () => {
  const router = useRouter();
  const { id } = router.query;
  const [categoryItem, setCategoryItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchCategoryById(id);
        if (response?.data?.length > 0) {
          setCategoryItem(response.data[0]);
        } else {
          toast({
            title: "Category not found",
            description: "No category found with the given ID.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Something went wrong while fetching category.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div
        className="relative h-[60vh] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${categoryItem.image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative h-full flex flex-col justify-center text-white px-6 md:px-12">
          <Link
            href="/"
            className="inline-flex items-center text-white mb-4 hover:text-primary-light"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold"
          >
            {categoryItem.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/90 max-w-xl mt-2"
          >
            {categoryItem.description}
          </motion.p>
        </div>
      </div>

      {/* Category Details */}
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-primary">
            Subcategory Details
          </h2>
          <img
            src={categoryItem.image}
            alt={categoryItem.name}
            className="w-full max-h-96 object-cover rounded-xl"
          />
          <p className="text-gray-700">{categoryItem.description}</p>

          {/* Key Attributes */}
          {categoryItem.keyAttributes?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-primary mb-2">
                Key Attributes
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoryItem.keyAttributes.map(
                  (attr: string, index: number) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {attr}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryById;
