import Link from "next/link";
import { Journey } from "@/types/interface";
import { getPageSectionData } from "@/lib/server-data";

interface JourneySectionProps {
  journeyData?: Journey;
}

const JourneySection = async ({
  journeyData: initialJourneyData,
}: JourneySectionProps) => {
  let journeyData = initialJourneyData;

  if (!journeyData) {
    try {
      journeyData = await getPageSectionData("journey", {
        isActiveKey: "steps",
      });
    } catch (error) {
      console.error("Error fetching journey data:", error);
      return null;
    }
  }

  if (!journeyData?.steps?.length) {
    return null;
  }

  return (
    <section
      id="journey"
      className="bg-secondary pb-6 pt-4 sm:pb-8 sm:pt-6 md:py-10"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-lg font-bold sm:text-xl md:text-2xl">
            {journeyData.title}
          </h2>

          <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm md:text-base">
            {journeyData.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
          {journeyData.steps.map((step, index) => {
            const className =
              "group relative aspect-square cursor-pointer overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md";

            const content = (
              <>
                {/* Image */}
                <img
                  src={step.imageUrl}
                  alt={step.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-white sm:px-3 sm:py-2 md:p-4">
                  <h3 className="truncate font-playfair text-[11px] font-semibold leading-tight sm:text-sm md:text-lg">
                    {step.title}
                  </h3>

                  <p className="line-clamp-2 text-sm text-white/80">
                    {step.description}
                  </p>
                </div>
              </>
            );

            if (step.linkType === "redirection" && step.link) {
              return (
                <Link
                  key={`${step.title}-${index}`}
                  href={step.link}
                  className={className}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {content}
                </Link>
              );
            }

            if (step.linkType === "action" && step.link) {
              return (
                <a
                  key={`${step.title}-${index}`}
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={`${step.title}-${index}`}
                className={className}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
