import { FNQ } from "@/types/interface";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPageSectionData } from "@/lib/server-data";

const FnqSection = async () => {
  let fnqData: FNQ[] = [];

  try {
    const data = await getPageSectionData("fnq");
    fnqData = data?.fnq ?? [];
  } catch (error) {
    console.error("Error fetching FNQ data:", error);
  }

  if (!fnqData.length) {
    return null;
  }

  return (
    <section className="bg-white py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-lg font-bold sm:text-xl md:text-2xl">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {fnqData.map((faq, index) => (
            <AccordionItem
              key={`faq-${index}`}
              value={`item-${index}`}
              className="rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 text-left text-sm font-medium sm:text-base">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-3 text-sm leading-relaxed text-gray-600">
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
