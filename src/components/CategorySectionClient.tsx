"use client";

import React from "react";
import { Category } from "@/types/interface";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import ImagePreviewModal from "@/components/admin/ImagePreviewModal";
import RibbonLabel from "./RibbonLabel";

interface CategorySectionClientProps {
  categories: Category[];
  onReady?: (categories: Category[]) => void;
}

const CategorySectionClient: React.FC<CategorySectionClientProps> = ({ 
  categories, 
  onReady 
}) => {
  // Call onReady when component mounts with data
  React.useEffect(() => {
    if (onReady) {
      onReady(categories);
    }
  }, [categories, onReady]);

  return (
    <section id="categories" className="w-full py-5 bg-transparent">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            Must-Have Categories
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
            Explore our exclusive collection of handcrafted pieces, designed
            with elegance.
          </p>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-1">
            {categories
              .sort((a, b) => a.rank - b.rank)
              .map((category, index) => (
                <Link
                  href={`/category/${category.id}`}
                  key={category.id}
                  className="group flex flex-col items-center w-full"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: 0,
                    animation: "fadeIn 0.7s ease-out forwards",
                  }}
                >
                  <div className="flex justify-center items-center w-full">
                    <Card className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                      {/* Add RibbonLabel here */}
                      {category.label && (
                        <RibbonLabel text={category.label.title} />
                      )}

                      <ImagePreviewModal
                        imageUrl={category.mImageUrl}
                        altText={category.name}
                      />
                      {category.mImageUrl ? (
                        <img
                          loading="lazy"
                          src={category.mImageUrl}
                          alt={category.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-700">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white px-2 py-3 transition-opacity duration-300">
                        <h2 className="text-sm font-bold mb-1 text-center leading-tight truncate">
                          {category.name}
                        </h2>
                        <p className="line-clamp-6 text-white/80 text-xs text-center leading-snug">
                          {category.description}
                        </p>
                      </div>
                    </Card>
                  </div>
                  <div className="mt-1 text-center text-xs font-semibold text-gray-800 transition-opacity duration-300 group-hover:opacity-0">
                    {category.name}
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <div
            className="overflow-x-auto px-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className={`flex space-x-6 min-w-fit items-center scroll-smooth snap-x ${
                categories.length <= 3 ? "justify-center" : "justify-start"
              }`}
              style={{ overflowY: "hidden" }}
            >
              {categories
                .sort((a, b) => a.rank - b.rank)
                .map((category, index) => (
                  <Link
                    href={`/category/${category.id}`}
                    key={category.id}
                    className="group flex-shrink-0 flex flex-col items-center snap-center"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      opacity: 0,
                      animation: "fadeIn 0.7s ease-out forwards",
                    }}
                  >
                    <Card className="relative w-72 h-[400px] rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                      {category.label && (
                        <RibbonLabel text={category.label.title} />
                      )}
                      <ImagePreviewModal
                        imageUrl={category.imageUrl}
                        altText={category.name}
                      />
                      {category.imageUrl ? (
                        <img
                          loading="lazy"
                          src={category.imageUrl}
                          alt={category.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-700">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white p-6 transition-opacity duration-300">
                        <h2 className="text-xl font-bold mb-3 truncate">
                          {category.name}
                        </h2>
                        <p className="line-clamp-6 text-white/80 text-base text-center">
                          {category.description}
                        </p>
                      </div>
                    </Card>
                    <div className="mt-2 text-xl text-center text-gray-900 transition-opacity duration-300 group-hover:opacity-0 truncate">
                      {category.name}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySectionClient;