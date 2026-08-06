import React from "react";
import { Category } from "@/types/interface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface CategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  isOpen,
  onClose,
}) => {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[80vh] max-h-[80vh]">
          {/* Left side - Category info */}
          <div className="w-full md:w-1/3 relative overflow-hidden">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-3xl font-playfair text-white mb-2">
                {category.name}
              </h2>
              <p className="text-white/90 text-sm">{category.description}</p>
            </div>
          </div>

          {/* Right side - Styles */}
          <div className="w-full md:w-2/3 overflow-y-auto p-6">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl font-playfair text-neutral-charcoal">
                  {category.name} Styles
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <DialogDescription>
                Explore our exclusive collection of{" "}
                {category.name.toLowerCase()} styles
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {category?.data?.map((style) => (
                <div
                  key={style.name}
                  className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-playfair text-lg font-medium mb-2">
                      {style.name}
                    </h3>
                    <p className="text-neutral-charcoal/70 text-sm">
                      {style.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
