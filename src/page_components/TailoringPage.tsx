"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Category } from "@/types/interface";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronsRight, MessageSquare, Calendar, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OfferBanner from "@/components/promotions/OfferBanner";
import OfferModal from "@/components/promotions/OfferModal";
import ReferralModal from "@/components/promotions/ReferralModal";
import SpinnerModal from "@/components/promotions/SpinnerModal";
import { Button } from "@/components/ui/button";
import { fetchAllCategories } from "@/services";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import RibbonLabel from "@/components/RibbonLabel";
import { getCategorySlug } from "@/lib/category-helpers";


const TailoringPage = ({
  initialCategories = [],
}: {
  initialCategories?: any[];
}) => {
  const [categories, setCategoriesData] = useState<any>(
    initialCategories.length > 0 ? initialCategories : null,
  );
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const couponCode = "WELCOME100";

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllCategories();
        setCategoriesData(
          data?.sort((a: any, b: any) => a.rank - b.rank) || [],
        );
      } catch (error) {
        console.error("Error fetching landing page data:", error);
        toast({
          title: "Error",
          description: "Failed to load product categories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Split categories into chunks of 4 for grid layout
  const chunkCategories = (arr: Category[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );
  };

  const categoriesInRows = categories ? chunkCategories(categories, 4) : [];

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  // Consultation options
  const consultationOptions = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Chat Now",
      description: "Connect with our experts instantly",
      link: "https://wa.me/918800633755?text=Hi%20Silaigo%20team!%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services.",
      linktype: "action",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book Appointment",
      description: "Schedule a detailed consultation",
      link: "https://silaigo.com/phone-call-schedule?catId=4",
      linktype: "redirection",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      description: "Speak with our tailoring experts",
      link: "tel:+918800633755",
      linktype: "action",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 ">
      <MetaTagsProvider
        title="Tailoring Collection | SilaiGo"
        description="Explore the finest tailoring collection at SilaiGo. Customize and order your favorite styles online."
        keywords="Tailoring Collection, SilaiGo, Tailoring Services, Tailoring, Tailor, Tailoring Shop, Tailoring Service, Tailoring Business, Tailoring Store, Tailoring Website, Tailoring Online, Tailoring Online Store, Tailoring Online Business, Tailoring Online Shop"
        canonicalPath="/tailoring"
      />
      {/* Hero Banner - Keeping the same component but changing colors */}
      <div className="relative h-[200px] sm:h-[260px]  md:h-[100%] p-2 md:pt-10  text-white ">
        <div className="container mx-auto px-4  ">
          <div className="flex flex-col md:flex-row items-center "></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>
      {/* Categories Grid Layout with Interspersed Banners - Moved to top */}
      <div className="container mx-auto px-4 py-6Can't find what you're looking for">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className=" text-lg sm:text-xl md:text-3xl  font-bold"
          >
            Our Tailoring Collection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className=" text-xs sm:text-base md:text-xl  text-gray-600 mt-2 max-w-2xl mx-auto"
          >
            Explore our extensive range of tailoring options, each designed with
            attention to detail and quality craftsmanship
          </motion.p>
        </div>

        <div className=" space-y-8 sm:space-y-16">
          {isLoading || !categories ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-primary font-medium">Loading collections...</p>
            </div>
          ) : (
            categoriesInRows.map((row, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {row.map((category: any, index) => (
                  <motion.div
                    key={category.id}
                    id={`category-${category.id}`}
                    custom={index}
                    variants={fadeInUpVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="group"
                  >
                    <Link href={`/category/${getCategorySlug(category)}`}>
                      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex-col">
                        <div className="relative h-64 overflow-hidden ">
                          {category.label && (
                            <RibbonLabel text={category.label.title} />
                          )}
                          <img
                            loading="lazy"
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <div className="text-white">
                              <p className="font-medium">Explore Collection</p>
                              <div className="flex items-center text-sm">
                                <span>View Styles</span>
                                <ChevronsRight className="h-4 w-4 ml-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-white flex flex-col justify-between flex-grow">
                          <div>
                            <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {category.name}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-5">
                              {category.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {category.styles &&
                              category.styles.slice(0, 3).map((style, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                                >
                                  {style.name}
                                </span>
                              ))}
                            {category.styles && category.styles.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                +{category.styles.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Promotion banners between rows - Moved up */}
              {/* {rowIndex === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <OfferBanner
                    title="Get 15% Off Your First Order"
                    description="Use code WELCOME15 at checkout"
                    buttonText="Get Offer"
                    bgColor="bg-primary"
                    textColor="text-white"
                    onClick={() => setShowOfferModal(true)}
                  />
                </motion.div>
              )}

              {rowIndex === 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <OfferBanner
                    title="Refer Friends & Get 20% Off"
                    description="Share your love for our collections"
                    buttonText="Refer Now"
                    bgColor="bg-emerald-600"
                    textColor="text-white"
                    onClick={() => setShowReferralModal(true)}
                  />
                </motion.div>
              )} */}

              {/* {rowIndex === Math.ceil(categories.length / 4) - 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <OfferBanner
                    title="Spin the Wheel & Win Prizes"
                    description="Try your luck for exclusive discounts"
                    buttonText="Spin Now"
                    bgColor="bg-purple-600"
                    textColor="text-white"
                    onClick={() => setShowSpinnerModal(true)}
                  />
                </motion.div>
              )} */}
            </React.Fragment>
          ))
        )}
        </div>
      </div>

      {/* Showcase Carousel - Featured Creations */}
      {/* <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold text-center mb-10">Featured Creations</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {[1, 2, 3, 4, 5].map((item) => (
                <CarouselItem key={item} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <Card className="overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-152349873${6570 + item}?q=80&w=600`} 
                        alt={`Featured item ${item}`}
                        className="w-full h-80 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">Exclusive Design {item}</h3>
                        <p className="text-sm text-gray-600">Handcrafted with premium materials</p>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </motion.div>
      </div> */}

      {/* "Confused?" Section */}
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 shadow-md"
        >
          <h2 className="text-xl sm:text-3xl font-bold text-center mb-2 sm:mb-6">
            Confused About What to Get Stitched?
          </h2>
          <p className=" text-sm  sm:text-lg text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Our expert tailors are here to help you make the right choice. Reach
            out to us through any of these channels for personalized guidance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consultationOptions.map((option, index) => {
              const content = (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                    <Button variant="link" className="mt-2">
                      Get Started
                    </Button>
                  </div>
                </motion.div>
              );

              return option.link ? (
                <a
                  key={index}
                  href={option.link}
                  target={
                    option.linktype === "redirection" ? "_self" : "_blank"
                  }
                  rel={
                    option.linktype === "redirection"
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <div key={index}>{content}</div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Reviews/Feedback Banner */}
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-xl p-4 sm:p-6 md:p-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white"
        >
          <div className="flex flex-col gap-4 xs:gap-6 md:flex-row items-start md:items-center justify-between">
            <div className="md:mr-10">
              <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-snug">
                Flat ₹100 OFF on Your First Order!
              </h3>
              <p className="text-xs sm:text-lg text-white/90 leading-snug">
                Use code WELCOME100 at checkout. No minimum order required.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="bg-pink-100 text-pink-700 font-semibold px-3 py-1 rounded-md text-sm sm:text-base">
                  Code: <span className="font-mono">{couponCode}</span>
                </span>
                <button
                  onClick={handleCopy}
                  className="text-sm sm:text-base font-medium bg-white text-pink-600 hover:bg-white/90 px-3 py-1 rounded-md border border-pink-300"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Welcome Offer"
        description="Enjoy 15% off your first order with us"
        discount="15% OFF"
        code="WELCOME15"
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

      <SpinnerModal
        isOpen={showSpinnerModal}
        onClose={() => setShowSpinnerModal(false)}
      />
    </div>
  );
};

export default TailoringPage;
