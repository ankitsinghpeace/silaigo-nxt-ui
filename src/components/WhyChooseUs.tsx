import { Home, Ruler, Palette, Truck } from "lucide-react"

const FEATURES = [
    {
        icon: Home,
        title: "Doorstep Pickup",
        description:
            "We pick up your fabric from your home — no need to visit a tailor shop.",
    },
    {
        icon: Ruler,
        title: "Professional Measurements",
        description:
            "Trained tailors take precise measurements at your doorstep for a perfect fit.",
    },
    {
        icon: Palette,
        title: "Custom Design Options",
        description:
            "Choose from 50+ neck, sleeve & back designs. Share reference images for exact replication.",
    },
    {
        icon: Truck,
        title: "Reliable Delivery",
        description:
            "Your perfectly stitched blouse delivered to your home within 5–7 working days.",
    },
]

export default function WhyChooseUs() {
    return (
        <section aria-labelledby="why-silaigo" className="w-full bg-background py-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
                <div className="mb-10">
                    <h2
                        id="why-silaigo"
                        className="text-3xl font-semibold md:text-4xl"
                        style={{
                            color: "var(--color-neutral-charcoal)",
                            fontFamily: "var(--font-playfair)",
                        }}
                    >
                        Why Choose SilaiGo Over Local Tailors?
                    </h2>

                    <p
                        className="mx-auto mt-3 max-w-2xl text-base md:text-lg"
                        style={{
                            color:
                                "color-mix(in srgb, var(--color-neutral-charcoal) 80%, transparent)",
                            fontFamily: "var(--font-montserrat)",
                        }}
                    >
                        Premium boutique stitching experience — from the comfort of your home.
                    </p>
                </div>

                <ul className="grid grid-cols-2 gap-4 md:gap-6">
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon

                        return (
                            <li
                                key={feature.title}
                                className="hover-card rounded-xl border p-4 text-center md:p-6"
                                style={{
                                    borderColor:
                                        "color-mix(in srgb, var(--color-neutral-charcoal) 10%, transparent)",
                                }}
                            >
                                <div className="mb-4 flex justify-center">
                                    <div
                                        className="flex h-14 w-14 items-center justify-center rounded-full"
                                        style={{
                                            background:
                                                "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                                        }}
                                    >
                                        <Icon
                                            className="h-6 w-6"
                                            strokeWidth={2}
                                            style={{ color: "var(--color-primary-dark)" }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>

                                <h3
                                    className="text-xl font-semibold"
                                    style={{
                                        fontFamily: "var(--font-playfair)",
                                        color: "var(--color-neutral-charcoal)",
                                    }}
                                >
                                    {feature.title}
                                </h3>

                                <p
                                    className="mx-auto mt-2 max-w-sm text-sm md:text-base"
                                    style={{
                                        fontFamily: "var(--font-montserrat)",
                                        color:
                                            "color-mix(in srgb, var(--color-neutral-charcoal) 80%, transparent)",
                                    }}
                                >
                                    {feature.description}
                                </p>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}