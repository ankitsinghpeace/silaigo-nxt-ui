"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import {
  ArrowRight,
  Phone,
  MessageSquare,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";

const categories = [
  {
    id: "kurti",
    title: "Kurti",
    tag: "Starting ₹700",
    num: "01",
    subcats: [
      {
        name: "Kurti Styles",
        items: [
          { name: "Straight Kurti", price: "₹700" },
          { name: "A-line Kurti", price: "₹700" },
          { name: "Slit Kurti", price: "₹800" },
          { name: "Kaftan Kurti", price: "₹800" },
        ],
      },
      {
        name: "Lining Options",
        items: [
          { name: "Without Lining", price: "Included" },
          { name: "With Lining", price: "+₹200" },
          { name: "Padded With Lining", price: "+₹750" },
        ],
      },
    ],
  },

  {
    id: "blouse",
    title: "Blouse",
    tag: "Starting ₹850",
    num: "02",
    subcats: [
      {
        name: "Blouse Styles",
        items: [
          { name: "Princess Cut Blouse", price: "₹850" },
          { name: "Four Dart Blouse", price: "₹850" },
          { name: "Halter Neck Blouse", price: "₹1,350" },
          { name: "Padded Blouse", price: "₹1,500" },
          { name: "Bridal Blouse (Padded)", price: "₹2,500" },
          { name: "Choli-cut Blouse (Padded)", price: "₹2,500" },
          { name: "Corset Blouse (Padded)", price: "₹2,500" },
          { name: "Designer Blouses (Padded)", price: "₹2,500" },
        ],
      },
      {
        name: "Lining Options",
        items: [
          { name: "Without Lining", price: "Included" },
          { name: "With Lining (Princess & Four Dart)", price: "+₹200" },
        ],
      },
    ],
  },

  {
    id: "suits",
    title: "Suits",
    tag: "Starting ₹900",
    num: "03",
    subcats: [
      {
        name: "Suit Styles",
        items: [
          { name: "Salwar Suit", price: "₹900" },
          { name: "Straight Suit", price: "₹1,000" },
          { name: "A-line Suit", price: "₹1,000" },
          { name: "Angrakha Suit", price: "₹1,200" },
          { name: "Kaftan Suit", price: "₹1,200" },
          { name: "Anarkali Suit", price: "₹2,000 onwards" },
        ],
      },
      {
        name: "Lining Options",
        items: [
          { name: "Without Lining", price: "Included" },
          { name: "Top Lining", price: "+₹400" },
          { name: "Full Lining", price: "+₹800" },
        ],
      },
    ],
  },

  {
    id: "sharara",
    title: "Sharara Sets",
    tag: "Starting ₹1,500",
    num: "04",
    subcats: [
      {
        name: "Sharara Set Styles",
        items: [
          { name: "Sharara Sets", price: "₹1,500" },
          { name: "Peplum + Sharara Set", price: "₹1,800" },
          { name: "Gharara Set", price: "₹1,800" },
        ],
      },
      {
        name: "Lining Options",
        items: [
          { name: "Without Lining", price: "Included" },
          { name: "Top Lining", price: "+₹400" },
          { name: "Full Lining", price: "+₹800" },
        ],
      },
    ],
  },

  {
    id: "coords",
    title: "Co-ord Sets",
    tag: "Starting ₹1,000",
    num: "05",
    subcats: [
      {
        name: "Co-ord Set Styles",
        items: [
          { name: "Short Kurta Pant Co-ord Set", price: "₹1,000" },
          { name: "Shirt Pant Co-ord Set", price: "₹1,200" },
          { name: "Waistcoat Pant Co-ord Set", price: "₹1,500" },
        ],
      },
      {
        name: "Lining Options",
        items: [
          { name: "Without Lining", price: "Included" },
          { name: "Top Lining", price: "+₹400" },
          { name: "Full Lining", price: "+₹800" },
        ],
      },
    ],
  },

  {
    id: "dresses",
    title: "Dresses",
    tag: "Starting ₹1,000 onwards",
    num: "06",
    subcats: [
      {
        name: "Dress Styles",
        items: [{ name: "Dresses", price: "₹1,000 onwards" }],
      },
    ],
  },

  {
    id: "sarees",
    title: "Ready To Wear Sarees",
    tag: "Starting ₹1,000",
    num: "07",
    subcats: [
      {
        name: "Saree Styles",
        items: [
          { name: "Pre-Pleated Saree (Half)", price: "₹1,000" },
          { name: "Pre-Pleated Saree (Full)", price: "₹1,350" },
        ],
      },
      {
        name: "Petticoat",
        items: [{ name: "With Petticoat", price: "+₹500" }],
      },
    ],
  },

  {
    id: "lehengas",
    title: "Lehengas",
    tag: "Starting ₹1,500",
    num: "08",
    subcats: [
      {
        name: "Lehenga Styles",
        items: [
          { name: "Lehenga (Umbrella Cut)", price: "₹1,500" },
          { name: "Gather Lehenga", price: "₹1,800" },
          { name: "Box Pleat Lehenga", price: "₹2,000" },
          { name: "12 Kali Lehenga", price: "₹2,500" },
          { name: "Fish Tail Lehenga", price: "₹2,500" },
          { name: "18+ Kali Lehenga", price: "₹3,000" },
        ],
      },
      {
        name: "CanCan Options",
        items: [
          { name: "Can-Can (Light)", price: "₹500" },
          { name: "Can-Can (Heavy)", price: "₹1,000" },
        ],
      },
    ],
  },
];

const addons = [
  { name: "Dori", price: "-" },
  { name: "Pipings", price: "₹50–₹200" },
  { name: "Latkans", price: "₹100 onwards" },
  { name: "Laces", price: "₹20 per meter onwards" },
  { name: "Fabric Buttons", price: "₹100" },
  { name: "Fancy Buttons", price: "₹100" },
  { name: "Pico", price: "₹50" },
  { name: "Fall n Pico", price: "₹200" },
];

const AccordionItem = ({
  subcat,
}: {
  subcat: { name: string; items: { name: string; price: string }[] };
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-lg border transition-all duration-200 overflow-hidden
        ${
          open
            ? "border-primary/30 shadow-md shadow-primary/5"
            : "border-border hover:border-primary/20 hover:shadow-sm"
        }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center justify-between w-full px-5 py-4 text-left transition-colors duration-150
          ${open ? "bg-primary/5" : "bg-white hover:bg-accent/40"}`}
      >
        <span className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          <span className="font-montserrat text-[13px] font-semibold text-neutral-charcoal tracking-wide uppercase">
            {subcat.name}
          </span>
        </span>
        <span
          className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200
            ${
              open
                ? "bg-primary border-primary text-white"
                : "bg-transparent border-primary/30 text-primary"
            }`}
        >
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-2 border-t border-border/60 bg-white">
              {subcat.items.map((item, i) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between py-3 transition-all duration-150 hover:pl-1
                    ${i < subcat.items.length - 1 ? "border-b border-border/40" : ""}`}
                >
                  <span className="flex items-center gap-2.5 font-montserrat text-[13px] text-muted-foreground font-normal">
                    <span className="text-primary/40 text-[10px] font-medium">
                      —
                    </span>
                    {item.name}
                  </span>
                  <div className="text-right">
                    <span className="block font-montserrat text-[8px] tracking-widest uppercase text-muted-foreground/60 mb-0.5">
                      From
                    </span>
                    <span className="font-playfair text-[20px] font-medium text-primary leading-none">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PricingPage = () => {
  const [activeSection, setActiveSection] = useState("kurti");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const allIds = [...categories.map((c) => c.id), "addons"];
    const observers: IntersectionObserver[] = [];

    allIds.forEach((id) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-15% 0px -75% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) =>
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  return (
    <div className="min-h-screen bg-background font-montserrat">
      <MetaTagsProvider
        title="Pricing | SilaiGo"
        description="Transparent pricing for our tailoring services. Quality stitching at affordable rates."
        canonicalPath="/pricing"
      />

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(190,65%,18%)] via-[hsl(190,65%,22%)] to-[hsl(190,55%,15%)]">
        <div
          className="absolute top-0 right-0 w-[560px] h-[560px] rounded-full pointer-events-none opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(190,65%,55%) 0%, transparent 70%)",
            transform: "translate(30%, -40%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pt-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-end">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <p className="font-montserrat text-[10px] tracking-[5px] uppercase text-primary-foreground/50 mb-5 font-medium">
              Transparent Pricing
            </p>
            <h1
              className="font-playfair font-medium text-primary-foreground leading-[1.02] tracking-tight"
              style={{ fontSize: "clamp(48px, 6vw, 82px)" }}
            >
              Every stitch,
              <br />
              <em className="not-italic font-light opacity-80">
                every price —
              </em>
              <br />
              <span className="text-[hsl(190,65%,75%)]">laid bare.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-8 pb-1"
          >
            <div className="grid grid-cols-3 border border-white/10 rounded-xl overflow-hidden">
              {[
                { n: "48h", l: "Delivery" },
                { n: "500+", l: "Categories" },
                { n: "₹0", l: "Hidden charges" },
              ].map((s, i) => (
                <div
                  key={s.l}
                  className={`px-5 py-5 bg-white/5 ${i < 2 ? "border-r border-white/10" : ""}`}
                >
                  <div className="font-playfair text-[32px] font-medium text-[hsl(190,65%,75%)] leading-none">
                    {s.n}
                  </div>
                  <div className="font-montserrat text-[9px] tracking-[2.5px] uppercase text-white/30 mt-1.5">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-white/15 to-transparent" />

            <p className="font-montserrat text-[13px] text-white/40 leading-[2] max-w-[380px] font-light">
              Browse by garment — each category lists every style with its base
              price and optional add-ons. What you see is exactly what you pay.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/918800633755?text=Hi%20SilaiGo%2C%20I%20want%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 !rounded !text-[11px] !tracking-widest !uppercase"
              >
                <MessageSquare size={14} />
                Book Stitching
              </a>
              <a
                href="tel:+918800633755"
                className="btn-outline inline-flex items-center gap-2 !rounded !text-[11px] !tracking-widest !uppercase !border-white/25 !text-white/70 hover:!bg-white/10 hover:!text-white hover:!border-white/40"
              >
                <Phone size={14} />
                Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] max-w-7xl mx-auto">
        <aside className="hidden lg:block border-r border-border bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 pt-10 pb-12">
            <span className="block font-montserrat text-[9px] tracking-[4px] uppercase text-muted-foreground/60 mb-5">
              Categories
            </span>
            <nav className="flex flex-col gap-0.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => scrollTo(c.id)}
                  className={`flex items-center justify-between pl-3 pr-2 py-2.5 rounded-md text-left w-full font-montserrat text-[12.5px] transition-all duration-150
                    ${
                      activeSection === c.id
                        ? "bg-accent text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                >
                  <span>{c.title}</span>
                  <span
                    className={`font-playfair text-[11px] italic transition-opacity ${activeSection === c.id ? "text-primary opacity-100" : "text-primary/30 opacity-60"}`}
                  >
                    {c.num}
                  </span>
                </button>
              ))}
              <div className="my-3 h-px bg-border" />
              <button
                onClick={() => scrollTo("addons")}
                className={`flex items-center justify-between pl-3 pr-2 py-2.5 rounded-md text-left w-full font-montserrat text-[12.5px] transition-all duration-150
                  ${
                    activeSection === "addons"
                      ? "bg-accent text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
              >
                <span>Add-ons</span>
                <span className="text-primary/40 text-[11px]">✦</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="px-5 py-12 lg:px-14 lg:py-14 bg-background">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el as HTMLDivElement | null;
              }}
              id={cat.id}
              className="relative mb-16 scroll-mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.03,
                ease: "easeOut",
              }}
              viewport={{ once: true, amount: 0.06 }}
            >
              <span
                className="absolute -top-6 right-0 font-playfair font-medium italic pointer-events-none select-none leading-none text-primary/[0.05]"
                style={{ fontSize: 120 }}
                aria-hidden
              >
                {cat.num}
              </span>

              <div className="relative flex items-end justify-between pb-4 mb-5 border-b border-primary/15">
                <h2 className="font-playfair text-[clamp(34px,4vw,52px)] font-medium text-foreground leading-none tracking-tight">
                  {cat.title}
                </h2>
                <span className="font-montserrat text-[9px] tracking-[3px] uppercase text-primary font-semibold pb-1">
                  {cat.tag}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {cat.subcats.map((sc) => (
                  <AccordionItem key={sc.name} subcat={sc} />
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div
            ref={(el) => {
              sectionRefs.current["addons"] = el as HTMLDivElement | null;
            }}
            id="addons"
            className="scroll-mt-8 bg-white rounded-xl border border-primary/15 overflow-hidden mb-14 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.06 }}
          >
            <div className="flex items-center gap-4 px-6 py-5 border-b border-border bg-accent/40">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-primary" />
              </div>
              <div>
                <div className="font-montserrat text-[10px] tracking-[3.5px] uppercase text-primary font-semibold">
                  Add-ons & Extras
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {addons.map((a, i) => (
                <div
                  key={a.name}
                  className={`px-5 py-4 transition-colors duration-150 hover:bg-accent/50
                    border-b border-border/50
                    ${(i + 1) % 4 !== 0 ? "border-r border-border/50" : ""}
                    `}
                >
                  <div className="font-montserrat text-[11.5px] text-muted-foreground mb-1.5 leading-tight">
                    {a.name}
                  </div>
                  <div className="font-playfair text-[22px] font-medium text-primary leading-none">
                    {a.price}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(190,65%,18%)] to-[hsl(190,65%,12%)]
              border border-primary/20 px-8 py-10 lg:px-12 lg:py-12
              flex flex-col lg:flex-row items-start lg:items-center justify-between gap-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 55% 140% at 100% 50%, hsl(190,65%,35%,0.15) 0%, transparent 65%)",
              }}
            />
            <div className="relative z-10">
              <p className="font-montserrat text-[9px] tracking-[5px] uppercase text-primary-foreground/40 font-medium mb-3">
                Ready to stitch?
              </p>
              <h3 className="font-playfair text-[clamp(28px,3.2vw,40px)] font-medium text-primary-foreground leading-tight mb-3">
                Get a free quote{" "}
                <em className="not-italic font-light text-[hsl(190,65%,72%)]">
                  in 5 minutes.
                </em>
              </h3>
              <p className="font-montserrat text-[12px] text-white/35 leading-[2] max-w-sm font-light">
                Share your measurements — we handle the rest.
                <br />
                48h delivery, zero hidden charges.
              </p>
            </div>
            <a
              href="https://wa.me/918800633755?text=Hi%20SilaiGo%2C%20I%20want%20a%20quote."
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-2.5 bg-primary-foreground text-primary
                font-montserrat text-[10px] font-bold tracking-[3px] uppercase px-8 py-4 rounded
                transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:-translate-y-[2px] flex-shrink-0"
            >
              Get Free Quote
              <ArrowRight size={14} />
            </a>
          </motion.div>

          <div className="h-20" />
        </main>
      </div>

      <div className="border-t border-border bg-white px-6 lg:px-16 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-center">
        <span className="font-playfair text-[13px] italic text-primary/40">
          SilaiGo
        </span>
        <span className="font-montserrat text-[9px] tracking-[2px] uppercase text-muted-foreground">
          All prices are base rates · Final quote after measurement
        </span>
        <span className="font-montserrat text-[9px] tracking-[2px] uppercase text-muted-foreground">
          Delhi NCR &nbsp;·&nbsp; 48h Delivery
        </span>
      </div>
    </div>
  );
};

export default PricingPage;
