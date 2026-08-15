import Link from "next/link";

export default function CTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="w-full px-4 py-16 text-center sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-dark-section)" }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        <h2
          id="cta-heading"
          className="font-playfair text-3xl font-bold leading-tight text-black/60 sm:text-4xl md:text-5xl"
        >
          Ready to Get Your Blouse Stitched?
        </h2>

        <div className="flex flex-col gap-1.5">
          <p className="font-montserrat text-base text-black/60 sm:text-lg">
            Book now and enjoy free doorstep pickup & delivery in Indirapuram.
          </p>

          <p className="font-montserrat text-base text-black/60 sm:text-lg">
            Your perfect blouse is just a click away.
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col items-center gap-5">
          <Link
            href="#book-stitching"
            className="inline-flex items-center justify-center rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-neutral-charcoal shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-gold/20 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #C9993A 100%)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
          >
            Book Stitching Now
          </Link>

          <p className="font-montserrat text-sm font-medium text-black/60 sm:text-base">
            Or WhatsApp us at{" "}
            <span className="font-bold text-black/60">+91 88006-33755</span>
          </p>
        </div>
      </div>
    </section>
  );
}
