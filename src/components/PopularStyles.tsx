import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { IPopularStylesData } from "@/lib/cms";
import Link from "next/link";


export default function PopularStyles({ popularStylesData }: { popularStylesData: IPopularStylesData }) {
    const { products, sectionHeading, sectionSubHeading } = popularStylesData;
    return (
        <section
            id="popular-styles"
            aria-labelledby="popular-styles-heading"
            className="w-full bg-secondary py-20 px-4 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-5xl text-center">

                <div className="mb-10 text-center">
                    <h2
                        id="popular-styles-heading"
                        className="text-3xl font-semibold md:text-4xl text-neutral-charcoal font-playfair"
                    >
                        {sectionHeading}
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-neutral-charcoal/80 font-montserrat">
                        {sectionSubHeading}
                    </p>
                </div>

                <ul className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
                    {products.map((product) => (
                        <li key={product.name}>
                            <Link href={product.productLink}>
                                <Card className="overflow-hidden border-none shadow-lg bg-secondary hover-card p-3 rounded-2xl transition-all duration-300">

                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary-foreground/10">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width:768px) 95vw, 45vw"
                                            className="object-cover"
                                            quality={75}
                                        />
                                    </div>

                                    <CardContent className="px-2 py-5 pb-2 text-left">

                                        <h3 className="text-xl font-semibold font-playfair text-neutral-charcoal leading-tight">
                                            {product.name}
                                        </h3>

                                        <p className="mt-2 text-lg font-montserrat text-gold font-bold">
                                            From ₹{product.price}
                                        </p>

                                    </CardContent>

                                </Card>
                            </Link>
                        </li>
                    ))}
                </ul>

            </div>
        </section>
    )
}