import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { IHeroData } from "@/lib/cms";

export default function HeroSection({ heroData }: { heroData: IHeroData }) {
  console.log("Rendering HeroSection with data: ", heroData);
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        {heroData.imageUrl ? (
          <Image
            src={heroData.imageUrl || null}
            alt="Professional blouse tailoring service"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                90deg,
                color-mix(in srgb, var(--color-primary-dark) 96%, transparent) 0%,
                color-mix(in srgb, var(--color-primary) 92%, transparent) 30%,
                color-mix(in srgb, var(--color-primary) 80%, transparent) 55%,
                color-mix(in srgb, var(--color-primary) 65%, transparent) 75%,
                color-mix(in srgb, var(--color-primary-light) 45%, transparent) 100%
              )
            `,
          }}
        />
      </div>

      <div className="section-container relative z-10 flex min-h-[calc(100dvh-4.5rem)] items-center justify-start py-24 pb-32">
        <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-2xl xl:max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
            {heroData.ctaText}
          </p>

          <h1
            id="hero-heading"
            className="text-4xl font-semibold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl font-playfair break-words"
          >
            {heroData.title}
          </h1>

          <p className="mt-8 text-base leading-loose text-primary-foreground/85 sm:text-lg whitespace-pre-line break-words line-clamp-6">
            {heroData.description}
          </p>
          <div className="mt-10">
            <Link
              href={heroData.ctaLink}
              className="inline-flex items-center justify-center rounded-xl bg-gold px-8 py-4 text-base font-semibold text-neutral-charcoal shadow-lg transition hover:opacity-90 sm:text-lg"
            >
              {heroData.ctaText}
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {heroData.trustBadges.map((item) => (
              <li
                key={item.value}
                className="flex items-center gap-2 text-sm text-primary-foreground/90 sm:text-base"
              >
                <Check className="h-4 w-4 text-gold-light" strokeWidth={2.5} />
                {item.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
