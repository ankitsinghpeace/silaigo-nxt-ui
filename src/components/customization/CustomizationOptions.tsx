"use client";
import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface CustomizationOption {
  id: number;
  name: string;
  description: string;
  images: string[];
}

interface CustomizationOptionsProps {
  options: CustomizationOption[];
  selectedOption: number | null;
  onSelect: (id: number) => void;
}

const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({
  options,
  selectedOption,
  onSelect,
}) => {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  // Display selected option images or hovered option images
  const displayOptionId =
    selectedOption !== null ? selectedOption : hoveredOption;
  const displayOption = options.find((opt) => opt.id === displayOptionId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Options selection */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Select an option:</h3>

        <RadioGroup
          value={selectedOption?.toString() || ""}
          onValueChange={(value) => onSelect(parseInt(value))}
          className="space-y-4"
        >
          {options.map((option) => (
            <div
              key={option.id}
              className={`flex items-start space-x-4 border rounded-lg p-4 transition-all cursor-pointer
                ${
                  option.id === selectedOption
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }
              `}
              onClick={() => onSelect(option.id)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              <RadioGroupItem
                value={option.id.toString()}
                id={`option-${option.id}`}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={`option-${option.id}`}
                  className="text-base font-medium cursor-pointer"
                >
                  {option.name}
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Image preview */}
      <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-center">
        {displayOption ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">{displayOption.name}</h3>

            {/* Image carousel */}
            <Carousel className="w-full max-w-md mx-auto">
              <CarouselContent>
                {displayOption.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-0 bg-transparent">
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`${displayOption.name} - View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative static mr-2 bg-white hover:bg-gray-100" />
                <CarouselNext className="relative static ml-2 bg-white hover:bg-gray-100" />
              </div>
            </Carousel>

            <p className="text-sm text-center text-gray-600">
              {selectedOption === null
                ? "Preview - Select this option to continue"
                : "Selected - Continue to next step when ready"}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Hover over or select an option to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationOptions;
