"use client";

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
      "Elevate your look with our precision-stitched blouses , designer detailing, perfect fitting, and styles crafted Just for you .",
    plan_price: "850",
    plan_feature: [
      "Wide Range of Neck & Back Designs",
      "Sleeve Style Customizations",
      "Padded & Lining Options",
      "Fine Stitching & Finishing",
      "48 - Hour Delivery",
    ],
    plan_recommended: false,
  },
  {
    plan_name: "Suits",
    plan_descp:
      "Elegant and perfectly tailored suits designed for comfort, style, and a refined everyday or festive look",
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
      "Masterpiece stitching for special occasions with luxury finishing and perfect fit",
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
      className="w-full py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-8 items-center justify-center w-full">
          {/* Heading */}
          <div className="flex flex-col gap-4 justify-center items-center text-center">
            <Badge
              variant="outline"
              className="py-1 px-3 text-sm font-medium text-primary border-primary/20 bg-primary/5 rounded-full"
            >
              Our Pricing
            </Badge>
            <div className="max-w-md mx-auto">
              <h2
                id="pricing-heading"
                className="text-neutral-charcoal text-3xl sm:text-5xl font-semibold font-playfair"
              >
                Transparent Pricing for Perfect Fitting
              </h2>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
            {pricingData.map((plan: PricingPlan, index: number) => {
              const isFeatured = plan.plan_recommended;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex flex-col w-full transition-all duration-300",
                    isFeatured && "z-10 md:scale-105",
                  )}
                >
                  {/* CARD */}
                  <Card
                    className={cn(
                      "flex-1 flex flex-col rounded-2xl p-8 gap-8 transition-shadow duration-300 hover:shadow-xl",
                      isFeatured
                        ? "border-2 border-primary shadow-lg ring-1 ring-primary/20"
                        : "border border-neutral-sand shadow-sm",
                    )}
                  >
                    <CardHeader className="p-0">
                      <div className="flex flex-col gap-3 self-stretch">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl font-semibold font-playfair text-primary">
                            {plan.plan_name}
                          </CardTitle>
                          {isFeatured && (
                            <Badge className="py-1 px-3 text-sm font-medium bg-primary text-white hover:bg-primary/90 border-none rounded-full flex items-center gap-1.5">
                              <Flame size={14} /> Popular
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm font-montserrat text-neutral-charcoal/70 leading-relaxed line-clamp-5">
                          {plan.plan_descp}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 gap-8 p-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-neutral-charcoal text-4xl font-semibold font-montserrat">
                          ₹{plan.plan_price}
                        </span>
                        <span className="text-neutral-charcoal/60 text-sm font-normal font-montserrat">
                          /onwards
                        </span>
                      </div>

                      <Separator className="bg-neutral-sand" />

                      <ul className="flex flex-col gap-3.5 flex-1">
                        {plan.plan_feature.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm font-normal text-neutral-charcoal/80 font-montserrat"
                          >
                            <Check
                              className="size-4 text-primary shrink-0 mt-0.5"
                              strokeWidth={3}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={cn(
                          "w-full h-12 text-base font-semibold transition-all duration-300 rounded-xl cursor-pointer",
                          isFeatured
                            ? "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg"
                            : "bg-white text-primary border-2 border-primary hover:bg-primary/5",
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
