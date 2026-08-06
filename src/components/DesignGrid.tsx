"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import { getCustomizationMappingOptions } from "@/services";
import { useQuery } from "@tanstack/react-query";

import PlaceholderImage from "../assets/custome-design-image-placeholder.svg";
import MultiImageBookingModal from "./MultiImageBookingModal";
import { useRouter } from "@/lib/next-router-compat";

const categories = [
  { id: "none", label: "None" },
  { id: "basic", label: "Basic" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

interface Design {
  _id: string;
  title: string;
  price: number;
  discountedPrice: number;
  category: string;
  imageUrl: string;
  complexity: string;
}

interface DesignGridProps {
  type: string;
  onSelectDesign?: (design: any) => void;
  setPage?: (page: number) => void;
  selectedCustomizations?: any[];
  onRemoveCustomization?: (id: string) => void;
  setUploadedImageUrls: React.Dispatch<React.SetStateAction<any[]>>;
  uploadedImages: string[];
}

const DesignGrid = ({
  type,
  onSelectDesign,
  selectedCustomizations = [],
  onRemoveCustomization,
  setUploadedImageUrls,
  uploadedImages,
}: DesignGridProps) => {
  const [visibleCategory, setVisibleCategory] = useState("basic");
  const { id: catId, styleId } = useRouter().query;
  const [showImagePicker, setShowImagePicker] = useState(false);

  const { data: designs = [], isLoading } = useQuery<Design[]>({
    queryKey: ["customizationOptions", type, styleId, catId],
    queryFn: async () => {
      const data = await getCustomizationMappingOptions({
        customizationType: type,
        subCategoryId: styleId,
        categoryId: catId,
      });

      const newData = data.map((elem) => ({
        ...elem,
        category:
          elem.complexity === "Basic"
            ? "basic"
            : elem.complexity === "Intermediate"
              ? "intermediate"
              : elem.complexity === "Advanced"
                ? "advanced"
                : "none",
        type: type,
      }));

      const groupedData = newData.reduce(
        (acc, curr) => {
          if (!acc[curr.category]) {
            acc[curr.category] = [];
          }
          acc[curr.category].push(curr);
          return acc;
        },
        {} as Record<string, Design[]>,
      );

      const sequentialData: Design[] = [];

      for (let i = 0; i < Object.keys(groupedData).length; i++) {
        if (Object.keys(groupedData)[i] === "none") {
          sequentialData.unshift(...groupedData[Object.keys(groupedData)[i]]);
        } else {
          sequentialData.push(...groupedData[Object.keys(groupedData)[i]]);
        }
      }

      return sequentialData;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const refs = {
    none: useRef<HTMLDivElement>(null),
    basic: useRef<HTMLDivElement>(null),
    intermediate: useRef<HTMLDivElement>(null),
    advanced: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            const category = entry.target.getAttribute("data-category");
            if (category) setVisibleCategory(category);
          }
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -23% 0px",
        threshold: 0.4,
      },
    );

    Object.values(refs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [designs]);

  const scrollToCategory = (id: string) => {
    refs[id as keyof typeof refs].current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const selectedDesign = selectedCustomizations.find(
    (sel) => sel.type === type,
  );

  return (
    <div className="flex flex-col h-full px-2 pt-2">
      <div className="sticky top-0 z-50 bg-white border-b py-1">
        <div className="text-sm font-semibold text-gray-700 text-center mb-1 capitalize">
          {type} Designs
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar px-1 justify-center">
          {categories.map((cat, index) => (
            <button
              key={`${cat.id}-${index}`}
              onClick={() => scrollToCategory(cat.id)}
              className={`text-xs px-2 pb-1 border-b-2 transition ${
                visibleCategory === cat.id
                  ? "text-primary border-primary font-semibold"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/*       {designs.length === 0 && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">No designs found</div>
        </div>
      )} */}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto">
          {/* Upload Card */}
          <button
            className={`p-1 rounded-md transition-all border flex flex-col items-center text-center`}
            onClick={() => setShowImagePicker(true)}
          >
            <div className="aspect-square bg-gray-100 w-full overflow-hidden rounded-sm">
              <img
                src={PlaceholderImage}
                alt={"Upload custom designs"}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
            <div className="text-xs font-medium mt-1 line-clamp-2 px-1">
              Upload custom designs
            </div>
            <div className="text-xs mt-1">
              <span className="text-primary font-semibold">
                {uploadedImages.length} selected
              </span>
            </div>
            <div className="mt-1 p-1 rounded-full border text-primary border-primary hover:bg-primary/10">
              <Plus className="w-4 h-4" />
            </div>
          </button>

          {/* Design Cards */}
          {designs.map((design) => {
            const isSelected = selectedDesign?._id === design._id;
            const isAnotherSelected = selectedDesign && !isSelected;

            return (
              <div
                key={design._id}
                onClick={() => {
                  onSelectDesign?.({ ...design, type });
                }}
                className={`p-1 rounded-md transition-all border flex flex-col items-center text-center cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/10 border-primary"
                    : isAnotherSelected
                      ? "opacity-50 pointer-events-auto border-gray-200 bg-gray-100"
                      : "hover:shadow-sm border-gray-200 bg-white hover:scale-[1.01]"
                }`}
                data-category={design.category}
                ref={refs[design.category as keyof typeof refs]}
              >
                <div className="aspect-square bg-gray-100 w-full overflow-hidden rounded-sm">
                  <img
                    src={
                      !design.imageUrl || design.imageUrl === ""
                        ? PlaceholderImage
                        : design.imageUrl
                    }
                    alt={design.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div className="text-xs font-medium mt-1 line-clamp-2 px-1">
                  {design.title}
                </div>
                <div className="text-xs mt-1">
                  {design.price !== design.discountedPrice ? (
                    <>
                      <span className="line-through text-gray-400">
                        ₹{design.price}
                      </span>{" "}
                      <span className="text-primary font-semibold">
                        ₹{design.discountedPrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-primary font-semibold">
                      ₹{design.price}
                    </span>
                  )}
                </div>
                <div
                  className={`mt-1 p-1 rounded-full border ${
                    isSelected
                      ? "text-red-500 border-red-300 hover:bg-red-50"
                      : "text-primary border-primary hover:bg-primary/10"
                  }`}
                >
                  {isSelected ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      {showImagePicker && (
        <MultiImageBookingModal
          open={showImagePicker}
          onOpenChange={setShowImagePicker}
          onImageSelect={(urls) => {
            setUploadedImageUrls((prev) => {
              const uniqueImages = [...new Set([...prev, ...urls])];
              return uniqueImages;
            });
          }}
          onClose={() => setShowImagePicker(false)}
          alreadySelectedImages={uploadedImages}
          onRemoveImage={(url) => {
            setUploadedImageUrls((prev) => prev.filter((img) => img !== url));
          }}
          type={type}
          isPreviewMode={true}
        />
      )}
    </div>
  );
};

export default DesignGrid;
