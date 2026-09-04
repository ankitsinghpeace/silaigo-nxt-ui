"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { motion } from "framer-motion";

// Reusable SVG Top Curve
const TopCurve = () => (
  <svg
    viewBox="0 0 1440 100"
    className="w-full -mb-1"
    preserveAspectRatio="none"
  >
    <path fill="#fff" d="M0,64 C480,0 960,128 1440,64 L1440,0 L0,0 Z"></path>
  </svg>
);

const SareesPage = () => {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-gray-800 font-sans">
      <MetaTagsProvider
        title="Saree Collections | SilaiGo"
        description="Explore the finest saree collections at SilaiGo. Customize and order your favorite styles online."
        canonicalPath="/sarees"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#f8f7f4] to-white pb-20">
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
            Introducing{" "}
            <span className="italic font-[cursive] text-primary">
              The Saree Edit
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            A celebration of culture, craftsmanship, and grace. Our saree
            collection is arriving soon — with artistry worth the wait.
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button asChild className="rounded-full px-6 py-3 text-base">
              <Link href="/#categories">Explore Current Collections</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full px-6 py-3 text-base border-gray-300"
            >
              <Link href="/tailoring">Our Tailoring Services</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Visual Grid Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-3">
              Draping Stories in Style
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our saree edit is designed to bring heritage and contemporary
              aesthetics together. Until it launches, you can explore our luxury
              stitching, made-to-measure styles, and expert draping services —
              ready to elevate any look.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1616756351484-798f37bdffa0?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Model in saree"
              className="rounded-xl object-cover shadow-md"
            />
            <img
              src="https://as2.ftcdn.net/v2/jpg/07/96/49/87/1000_F_796498717_VJ4XyuTXqKA0K2LKvFAQjFkZUsibQkJW.jpg"
              alt="Fabric closeup"
              className="rounded-xl object-cover shadow-md"
            />
          </motion.div>
        </div>
      </section>

      {/* Decorative Vector + Newsletter */}
      <section className="bg-[#fefefe] py-20 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-32 h-32 opacity-10 rotate-45 bg-[url('https://www.svgrepo.com/show/474960/lotus-flower.svg')] bg-contain bg-no-repeat"></div>

        <div className="container mx-auto px-6 max-w-2xl text-center">
          <motion.h3
            className="text-2xl md:text-3xl font-serif text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Be the First to Know
          </motion.h3>
          <motion.p
            className="text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Sign up and receive early access to our saree collection and other
            curated drops.
          </motion.p>

          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <Button type="submit" className="rounded-full px-6 py-3 text-base">
              Notify Me
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-4">
            No spam, just graceful updates.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SareesPage;
