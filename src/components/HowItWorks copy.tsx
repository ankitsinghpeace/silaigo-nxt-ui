import { Calendar, Package, Scissors, Truck } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: Calendar,
    title: "Book Online",
    description: "Schedule a pickup slot from our website or WhatsApp.",
  },
  {
    id: 2,
    icon: Package,
    title: "Fabric Pickup & Measurements",
    description:
      "Our executive visits your home to collect fabric and take measurements.",
  },
  {
    id: 3,
    icon: Scissors,
    title: "Expert Stitching",
    description:
      "Your blouse is stitched by experienced karigar with quality checks.",
  },
  {
    id: 4,
    icon: Truck,
    title: "Home Delivery",
    description: "Your perfectly tailored blouse is delivered to your doorstep.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="w-full bg-background py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2
            id="how-it-works-heading"
            className="font-playfair text-4xl md:text-5xl font-bold text-neutral-charcoal mb-4"
          >
            How SilaiGo Works
          </h2>
          <p className="text-neutral-charcoal/80 text-base md:text-lg max-w-xl mx-auto font-montserrat">
            From booking to delivery — a seamless 4-step experience.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-[36px] left-[12.5%] right-[12.5%] h-px bg-neutral-taupe/50 z-0"
          />

          <ol className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
            {steps.map(({ id, icon: Icon, title, description }) => (
              <li
                key={id}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className="w-[72px] h-[72px] rounded-full bg-primary/10 flex items-center justify-center mb-5 shadow-md
                    transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  aria-hidden="true"
                >
                  <Icon className="w-7 h-7 text-primary-dark" strokeWidth={1.8} />
                </div>

                <span className="text-[11px] font-semibold tracking-widest uppercase text-gold mb-2 font-montserrat">
                  Step {id}
                </span>

                <h3 className="font-playfair text-xl font-bold text-neutral-charcoal mb-2 leading-snug">
                  {title}
                </h3>

                <p className="text-sm text-neutral-charcoal/75 leading-relaxed font-montserrat max-w-[200px]">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
