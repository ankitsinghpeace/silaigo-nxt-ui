"use client";

import Link from "next/link";

export default function CTA() {
    return (
        <section
            aria-labelledby="cta-heading"
            className="w-full py-16 px-4 sm:px-6 lg:px-8 text-center"
            style={{ backgroundColor: "var(--color-dark-section)" }}
        >
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-5">
                <h2
                    id="cta-heading"
                    className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-black/60 leading-tight"
                >
                    Ready to Get Your Blouse Stitched?
                </h2>

                <div className="flex flex-col gap-1.5">
                    <p className="text-black/60 text-base sm:text-lg font-montserrat">
                        Book now and enjoy free doorstep pickup & delivery in Indirapuram.
                    </p>
                    <p className="text-black/60 text-base sm:text-lg font-montserrat">
                        Your perfect blouse is just a click away.
                    </p>
                </div>

                <div className="mt-2 flex flex-col items-center gap-5 w-full">
                    <Link
                        href="#book-stitching"
                        className="inline-flex items-center justify-center rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-neutral-charcoal shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-gold/20 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #D4AF37 0%, #C9993A 100%)",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                        }}
                    >
                        Book Stitching Now
                    </Link>

                    <p className="text-black/60 text-sm sm:text-base font-montserrat font-medium">
                        Or WhatsApp us at <span className="text-black/60 font-bold">+91 88006-33755</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
