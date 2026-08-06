import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AreasWeServeProps = {
  location?: string;
  areas?: string[];
};

export default function AreasWeServe({
  location = "Indirapuram",
  areas = [],
}: AreasWeServeProps) {
  if (!areas || areas.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="areas-heading"
      className="w-full bg-muted py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2
            id="areas-heading"
            className="font-playfair text-4xl md:text-5xl font-bold text-neutral-charcoal mb-4"
          >
            Areas We Serve Near {location}
          </h2>
          <p className="text-neutral-charcoal/80 text-base md:text-lg font-montserrat">
            Free doorstep pickup &amp; delivery across {location} and nearby
            areas.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {areas.map((area) => (
            <Badge
              key={area}
              variant="outline"
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-montserrat font-medium
                bg-white border border-neutral-sand text-neutral-charcoal
                hover:border-primary hover:text-primary hover:bg-primary/5
                transition-all duration-200 cursor-default shadow-sm hover:shadow-md"
            >
              <MapPin
                className="w-4 h-4 text-primary shrink-0"
                strokeWidth={2.5}
              />
              {area}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
