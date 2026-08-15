import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Flame } from "lucide-react";

type PricingPlan = {
  plan_name: string;
  plan_descp: string;
  plan_price: string;
  plan_feature: string[];
  plan_recommended: boolean;
};

type PricingProps = {
  pricingData?: PricingPlan[];
};

const defaultPricingData: PricingPlan[] = [
  {
    plan_name: "Blouses",
    plan_descp:
      "Elevate your look with our precision-stitched blouses, designer detailing, perfect fitting, and styles crafted just for you.",
    plan_price: "850",
    plan_feature: [
      "Wide Range of Neck & Back Designs",
      "Sleeve Style Customizations",
      "Padded & Lining Options",
      "Fine Stitching & Finishing",
      "48-Hour Delivery",
    ],
    plan_recommended: false,
  },
  {
    plan_name: "Suits",
    plan_descp:
      "Elegant and perfectly tailored suits designed for comfort, style, and a refined everyday or festive look.",
    plan_price: "1000",
    plan_feature: [
      "Customized Fit & Styling",
      "Support for All Suit Types (Anarkali, A-Line, Straight)",
      "Clean & Structured Finishing",
      "Lining & Detailing Options",
      "Expert Design Guidance",
    ],
    plan_recommended: false,
  },
  {
    plan_name: "Lehenga",
    plan_descp:
      "Masterpiece stitching for special occasions with luxury finishing and perfect fit.",
    plan_price: "1500",
    plan_feature: [
      "Custom Designs & Styles",
      "Heavy Embroidery Support",
      "Couture Finished Fits",
      "Custom Latkan & Handwork",
      "Dedicated Style Expert",
    ],
    plan_recommended: false,
  },
];

const Pricing = ({ pricingData = defaultPricingData }: PricingProps) => {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="w-full px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex w-full flex-col items-center justify-center gap-8">
          {/* Heading */}
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
            >
              Our Pricing
            </Badge>

            <div className="mx-auto max-w-md">
              <h2
                id="pricing-heading"
                className="font-playfair text-3xl font-semibold text-neutral-charcoal sm:text-5xl"
              >
                Transparent Pricing for Perfect Fitting
              </h2>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {pricingData.map((plan) => {
              const isFeatured = plan.plan_recommended;

              return (
                <div
                  key={plan.plan_name}
                  className={cn(
                    "relative flex w-full flex-col transition-all duration-300",
                    isFeatured && "z-10 md:scale-105",
                  )}
                >
                  {/* Card */}
                  <Card
                    className={cn(
                      "flex flex-1 flex-col gap-8 rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl",
                      isFeatured
                        ? "border-2 border-primary shadow-lg ring-1 ring-primary/20"
                        : "border border-neutral-sand shadow-sm",
                    )}
                  >
                    <CardHeader className="p-0">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="font-playfair text-2xl font-semibold text-primary">
                            {plan.plan_name}
                          </CardTitle>

                          {isFeatured && (
                            <Badge className="flex items-center gap-1.5 rounded-full border-none bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary/90">
                              <Flame size={14} />
                              Popular
                            </Badge>
                          )}
                        </div>

                        <CardDescription className="line-clamp-5 font-montserrat text-sm leading-relaxed text-neutral-charcoal/70">
                          {plan.plan_descp}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-8 p-0">
                      {/* Price */}
                      <div className="flex items-baseline gap-1">
                        <span className="font-montserrat text-4xl font-semibold text-neutral-charcoal">
                          ₹{plan.plan_price}
                        </span>

                        <span className="font-montserrat text-sm font-normal text-neutral-charcoal/60">
                          /onwards
                        </span>
                      </div>

                      <Separator className="bg-neutral-sand" />

                      {/* Features */}
                      <ul className="flex flex-1 flex-col gap-3.5">
                        {plan.plan_feature.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 font-montserrat text-sm font-normal text-neutral-charcoal/80"
                          >
                            <Check
                              className="mt-0.5 size-4 shrink-0 text-primary"
                              strokeWidth={3}
                            />

                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        className={cn(
                          "h-12 w-full cursor-pointer rounded-xl text-base font-semibold transition-all duration-300",
                          isFeatured
                            ? "bg-primary text-white shadow-md hover:bg-primary-dark hover:shadow-lg"
                            : "border-2 border-primary bg-white text-primary hover:bg-primary/5",
                        )}
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
