"use client";
import React from "react";
import Link from "next/link";
import { Gift, Heart, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";

// Curve SVG at top
const TopCurve = () => (
  <svg
    viewBox="0 0 1440 100"
    className="w-full -mb-1"
    preserveAspectRatio="none"
  >
    <path fill="#fff" d="M0,64 C480,0 960,128 1440,64 L1440,0 L0,0 Z"></path>
  </svg>
);

const MenPage = () => {
  return (
    <div className="min-h-screen bg-[#f8f8f6] text-gray-800 font-sans">
      <MetaTagsProvider
        title="Men's Collection | SilaiGo"
        description="While our men's collection is on the way, explore thoughtful gifting and custom stitching for someone special."
        keywords="Menswear, Custom Tailoring, Gift Stitching, SilaiGo Men"
        canonicalPath="/men"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#f8f8f6] to-white pb-20">
        <div className="absolute top-0 left-0 w-full">
          <TopCurve />
        </div>

        <div className="container mx-auto px-6 pt-28 md:pt-40 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-serif text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Coming Soon
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            While our collection for men is being tailored to perfection, why
            not surprise someone special — your sister, mother, or partner —
            with a thoughtful custom piece?
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button asChild className="rounded-full px-6 py-3 text-base">
              <Link href="/tailoring">
                Gift a Custom Stitch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full px-6 py-3 text-base border-gray-300"
            >
              <Link href="/#categories">Explore Other Collections</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Gift Suggestions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-2xl md:text-3xl font-serif font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            A Gift Worth Wearing
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-12 max-w-2xl mx-auto text-base md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Make your loved ones feel truly special — with a handcrafted outfit,
            tailored just for them.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Gift className="text-pink-500 w-6 h-6" />,
                title: "Perfect for Gifting",
                desc: "Custom-stitched clothing is a timeless and thoughtful present.",
              },
              {
                icon: <Sparkles className="text-yellow-500 w-6 h-6" />,
                title: "Any Occasion Works",
                desc: "From birthdays to anniversaries — or simply to show you care.",
              },
              {
                icon: <Heart className="text-red-500 w-6 h-6" />,
                title: "Tailored With Love",
                desc: "Because there’s no better fit than one made just for them.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="mb-4 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MenPage;
