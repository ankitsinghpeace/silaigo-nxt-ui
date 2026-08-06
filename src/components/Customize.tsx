
import { ICustomizeData } from "@/lib/cms";

export default function Customize({ customizeData }: { customizeData: ICustomizeData }) {
    const { sectionSubHeading, customizeOptions } = customizeData;
    return (
        <section
            id="customize"
            aria-labelledby="customize-heading"
            style={{ backgroundColor: "var(--color-dark-section)" }}
        >
            <div className="w-full mx-auto max-w-5xl py-20 px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-14">
                    <h2
                        id="customize-heading"
                        className="text-3xl font-semibold md:text-4xl"
                        style={{
                            fontFamily: "var(--font-display)",
                            color: "var(--color-neutral-ivory)",
                        }}
                    >
                        Customize Every Detail
                    </h2>
                    <p
                        className="mx-auto mt-3 max-w-2xl text-base md:text-lg"
                        style={{
                            color: "var(--color-dark-section-foreground)",
                            opacity: 0.85,
                        }}
                    >
                        {sectionSubHeading}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {customizeOptions.map(({ title, items }) => (
                        <div
                            key={title}
                            className="rounded-xl p-8"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            <h3
                                className="text-2xl mb-4"
                                style={{
                                    fontFamily: "var(--font-display)",
                                    color: "var(--color-neutral-ivory)",
                                }}
                            >
                                {title}
                            </h3>

                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.value} className="flex items-center gap-3">
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: "var(--color-gold-light)" }}
                                        />
                                        <span style={{ color: "var(--color-dark-section-foreground)" }}>
                                            {item.value}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    )
}
