"use client";
import React, { useEffect, useState } from "react";
import { FNQ } from "@/types/interface";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchPageSectionData } from "@/services";

interface FnqSectionProps {
  onReady?: () => void;
}

const FnqSection: React.FC<FnqSectionProps> = ({ onReady }) => {
  const [fnqData, setFnqData] = useState<FNQ[] | null>(null);

  useEffect(() => {
    const loadFnqData = async () => {
      try {
        const data = await fetchPageSectionData("fnq");
        setFnqData(data.fnq);
        if (onReady) {
          onReady();
        }
      } catch (error) {
        console.error("Error fetching FNQ data:", error);
      }
    };
    loadFnqData();
  }, [onReady]);

  if (!fnqData) return null;

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-white">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="mx-auto px-4 sm:px-6 md:px-8 max-w-screen-md">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {fnqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-md"
            >
              <AccordionTrigger className="text-sm sm:text-base font-medium px-4 py-3 text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FnqSection;
