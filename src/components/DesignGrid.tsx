import { getCustomizationMappingOptions } from "@/services";
import PlaceholderImage from "../assets/custome-design-image-placeholder.svg";
import MultiImageBookingModal from "./MultiImageBookingModal";
import { Plus, Minus } from "lucide-react";

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
  type?: string;
}

interface DesignGridProps {
  type: string;
  categoryId?: string;
  styleId?: string;
}

const DesignGrid = async ({ type, categoryId, styleId }: DesignGridProps) => {
  const data = await getCustomizationMappingOptions({
    customizationType: type,
    subCategoryId: styleId,
    categoryId,
  });

  const designs: Design[] = data.map((elem: any) => ({
    ...elem,
    category:
      elem.complexity === "Basic"
        ? "basic"
        : elem.complexity === "Intermediate"
          ? "intermediate"
          : elem.complexity === "Advanced"
            ? "advanced"
            : "none",
    type,
  }));

  const groupedData = designs.reduce(
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

  Object.keys(groupedData).forEach((category) => {
    if (category === "none") {
      sequentialData.unshift(...groupedData[category]);
    } else {
      sequentialData.push(...groupedData[category]);
    }
  });

  const renderCategory = (categoryId: string, label: string) => {
    const categoryDesigns = sequentialData.filter(
      (design) => design.category === categoryId,
    );

    if (!categoryDesigns.length) {
      return null;
    }

    return (
      <section
        id={`design-category-${categoryId}`}
        data-category={categoryId}
        className="scroll-mt-20"
      >
        <div className="mb-2 px-1 text-xs font-semibold capitalize text-gray-600">
          {label}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {categoryDesigns.map((design) => (
            <div
              key={design._id}
              className="flex cursor-pointer flex-col items-center rounded-md border border-gray-200 bg-white p-1 text-center transition-all hover:scale-[1.01] hover:shadow-sm"
              data-design-id={design._id}
              data-design-type={type}
            >
              <div className="aspect-square w-full overflow-hidden rounded-sm bg-gray-100">
                <img
                  src={
                    !design.imageUrl || design.imageUrl === ""
                      ? PlaceholderImage
                      : design.imageUrl
                  }
                  alt={design.title}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>

              <div className="mt-1 line-clamp-2 px-1 text-xs font-medium">
                {design.title}
              </div>

              <div className="mt-1 text-xs">
                {design.price !== design.discountedPrice ? (
                  <>
                    <span className="text-gray-400 line-through">
                      ₹{design.price}
                    </span>{" "}
                    <span className="font-semibold text-primary">
                      ₹{design.discountedPrice}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-primary">
                    ₹{design.price}
                  </span>
                )}
              </div>

              <div className="mt-1 rounded-full border border-primary p-1 text-primary">
                <Plus className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="flex h-full flex-col px-2 pt-2">
      {/* Category Navigation */}
      <div className="sticky top-0 z-50 border-b bg-white py-1">
        <div className="mb-1 text-center text-sm font-semibold capitalize text-gray-700">
          {type} Designs
        </div>

        <nav
          aria-label={`${type} design categories`}
          className="flex justify-center space-x-2 overflow-x-auto px-1 no-scrollbar"
        >
          {categories.map((category) => {
            const hasDesigns = sequentialData.some(
              (design) => design.category === category.id,
            );

            if (!hasDesigns) {
              return null;
            }

            return (
              <a
                key={category.id}
                href={`#design-category-${category.id}`}
                className="border-b-2 border-transparent px-2 pb-1 text-xs text-gray-500 transition hover:border-primary hover:text-primary"
              >
                {category.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Upload Card */}
      <div className="grid grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
        <div className="flex flex-col items-center rounded-md border p-1 text-center">
          <div className="aspect-square w-full overflow-hidden rounded-sm bg-gray-100">
            <img
              src={PlaceholderImage}
              alt="Upload custom designs"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <div className="mt-1 line-clamp-2 px-1 text-xs font-medium">
            Upload custom designs
          </div>

          <div className="mt-1 text-xs">
            <span className="font-semibold text-primary">
              Upload custom designs
            </span>
          </div>

          <div className="mt-1 rounded-full border border-primary p-1 text-primary">
            <Plus className="h-4 w-4" />
          </div>
        </div>

        {/* Server-rendered Design Sections */}
        <div className="col-span-full flex flex-col gap-6">
          {renderCategory("none", "None")}
          {renderCategory("basic", "Basic")}
          {renderCategory("intermediate", "Intermediate")}
          {renderCategory("advanced", "Advanced")}
        </div>
      </div>
    </div>
  );
};

export default DesignGrid;
