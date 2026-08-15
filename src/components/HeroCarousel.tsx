import Link from "next/link";
import { getPageSectionData } from "@/lib/server-data";
import { HeroSlide } from "@/types/interface";

interface HeroCarouselProps {
  hero?: HeroSlide[];
}

const HeroCarousel = async ({ hero: initialHero }: HeroCarouselProps) => {
  let hero = initialHero;

  if (!hero) {
    try {
      const data = await getPageSectionData("hero");
      hero = data?.hero ?? [];
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      hero = [];
    }
  }

  if (!hero.length) {
    return null;
  }

  const firstSlide = hero[0];

  return (
    <section aria-label="Hero" className="relative w-full overflow-hidden">
      <div className="relative aspect-[16/8] w-full md:aspect-[16/5] lg:aspect-[16/2.5]">
        <Link
          href={firstSlide.link || "/tailoring"}
          className="block h-full w-full"
        >
          {firstSlide.lgImage || firstSlide.mdImage || firstSlide.smImage ? (
            <picture>
              {firstSlide.smImage && (
                <source
                  media="(max-width: 767px)"
                  srcSet={firstSlide.smImage}
                />
              )}

              {firstSlide.mdImage && (
                <source
                  media="(max-width: 1023px)"
                  srcSet={firstSlide.mdImage}
                />
              )}

              <img
                src={
                  firstSlide.lgImage || firstSlide.mdImage || firstSlide.smImage
                }
                alt={firstSlide.title || "Hero banner"}
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </picture>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-300 text-xl font-semibold text-white">
              No Image Available
            </div>
          )}
        </Link>
      </div>

      {hero.length > 1 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {hero.map((slide, index) => (
            <span
              key={slide.title || index}
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                index === 0 ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
