// Static data that simulates API response
// Replace these functions with actual API calls when ready

export interface HeroData {
  tagline: string
  title: string
  description: string
  ctaText: string
  stats: { icon: string; label: string }[]
}

export interface Feature {
  icon: string
  title: string
  description: string
}

export interface Step {
  icon: string
  step: number
  title: string
  description: string
}

export interface PricingPlan {
  name: string
  description: string
  price: number
  currency: string
  features: string[]
  ctaText: string
  highlighted?: boolean
}

export interface CustomizationCategory {
  title: string
  items: string[]
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface ServiceArea {
  name: string
}

// API simulation functions
export async function getHeroData(): Promise<HeroData> {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return {
    tagline: "BOOK YOUR CONSULTATION",
    title: "Custom Blouse Stitching at Your Doorstep",
    description: "Custom Blouse Stitching at Your Doorstep brings you a seamless, stress-free tailoring experience designed around your comfort. No more multiple visits to local tailors or compromising on fit—our experts come to your home, understand your requirements, and create a blouse that fits you perfectly. With free home pickup and delivery, you can sit back while we handle everything end-to-end.",
    ctaText: "Book Your Consultation",
    stats: [
      { icon: "star", label: "4.8 rating" },
      { icon: "check", label: "5000+ Blouses Stitched" },
      { icon: "check", label: "Home measurement available" },
      { icon: "check", label: "48 hours delivery" },
    ],
  }
}

export async function getFeatures(): Promise<Feature[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return [
    {
      icon: "home",
      title: "Doorstep Pickup",
      description: "We pick up your fabric from your home — no need to visit a tailor shop.",
    },
    {
      icon: "ruler",
      title: "Professional Measurements",
      description: "Trained tailors take precise measurements at your doorstep for a perfect fit.",
    },
    {
      icon: "palette",
      title: "Custom Design Options",
      description: "Choose from 50+ neck, sleeve & back designs. Share reference images for exact replication.",
    },
    {
      icon: "truck",
      title: "Reliable Delivery",
      description: "Your perfectly stitched blouse delivered to your home within 5–7 working days.",
    },
  ]
}

export async function getSteps(): Promise<Step[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return [
    {
      icon: "calendar",
      step: 1,
      title: "Book Online",
      description: "Schedule a pickup slot from our website or WhatsApp.",
    },
    {
      icon: "package",
      step: 2,
      title: "Fabric Pickup & Measurements",
      description: "Our executive visits your home to collect fabric and take measurements.",
    },
    {
      icon: "scissors",
      step: 3,
      title: "Expert Stitching",
      description: "Your blouse is stitched by experienced karigar with quality checks.",
    },
    {
      icon: "truck",
      step: 4,
      title: "Home Delivery",
      description: "Your perfectly tailored blouse is delivered to your doorstep.",
    },
  ]
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return [
    {
      name: "Blouses",
      description: "Elevate your look with our precision-stitched blouses, designer detailing, perfect fitting, and styles crafted just for you.",
      price: 850,
      currency: "₹",
      features: [
        "Wide Range of Neck & Back Designs",
        "Sleeve Style Customizations",
        "Padded & Lining Options",
        "Fine Stitching & Finishing",
        "48 - Hour Delivery",
      ],
      ctaText: "Book Now",
    },
    {
      name: "Suits",
      description: "Elegant and perfectly tailored suits designed for comfort, style, and a refined everyday or festive look.",
      price: 1000,
      currency: "₹",
      features: [
        "Customized Fit & Styling",
        "Support for All Suit Types (Anarkali, A-Line, Straight)",
        "Clean & Structured Finishing",
        "Lining & Detailing Options",
        "Expert Design Guidance",
      ],
      ctaText: "Book Now",
      highlighted: true,
    },
    {
      name: "Lehenga",
      description: "Masterpiece stitching for special occasions with luxury finishing and perfect fit.",
      price: 1500,
      currency: "₹",
      features: [
        "Custom Designs & Styles",
        "Heavy Embroidery Support",
        "Couture Finished Fits",
        "Custom Latkan & Handwork",
        "Dedicated Style Expert",
      ],
      ctaText: "Book Now",
    },
  ]
}

export async function getCustomizationOptions(): Promise<CustomizationCategory[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return [
    {
      title: "Neck Design",
      items: ["Sweetheart", "Boat neck", "Deep back", "Round neck", "V neck"],
    },
    {
      title: "Sleeve Styles",
      items: ["Puff Sleeves", "Full Sleeves", "3/4 Sleeves", "Cap Sleeves", "Off Shoulder", "Sleeveless", "Noodle strap"],
    },
    {
      title: "Back Neck",
      items: ["Backless", "Potli Button", "Dori Tie-Up", "Keyhole Back", "Deep V Back"],
    },
    {
      title: "ADD Ons",
      items: ["Lining", "Padding", "Pipings", "Laces", "Dori", "Buttons", "Tassels", "Embroidery"],
    },
  ]
}

export async function getProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return [
    { id: "1", name: "Classic Boat Neck Blouse", price: 799, image: "/products/blouse-1.jpg" },
    { id: "2", name: "Princess Cut Blouse", price: 899, image: "/products/blouse-2.jpg" },
    { id: "3", name: "Designer Back Blouse", price: 999, image: "/products/blouse-3.jpg" },
    { id: "4", name: "Embroidered Blouse", price: 1299, image: "/products/blouse-4.jpg" },
  ]
}

export async function getFAQs(): Promise<FAQ[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return [
    {
      question: "How does the doorstep fabric pickup work?",
      answer: "Simply book a slot through our website or WhatsApp, and our executive will visit your home at the scheduled time to collect your fabric and take measurements. It's completely free!",
    },
    {
      question: "Do I need to provide the lining and other materials?",
      answer: "No, we provide all the necessary materials including lining, padding, and other add-ons. You just need to provide the main fabric. Additional materials are charged separately.",
    },
    {
      question: "What is your typical delivery timeline?",
      answer: "Our standard delivery timeline is 5-7 working days. For urgent orders, we offer 48-hour express delivery at an additional charge.",
    },
    {
      question: "What if the fitting is not perfect?",
      answer: "We offer free alterations within 7 days of delivery. Our expert tailors will make adjustments to ensure a perfect fit.",
    },
    {
      question: "Can I share my own design images?",
      answer: "Absolutely! You can share reference images via WhatsApp or during the pickup visit. Our tailors will replicate the design exactly as shown.",
    },
    {
      question: "Are there any extra charges for customizations?",
      answer: "Basic customizations like neck and sleeve styles are included. Heavy embroidery, handwork, and premium add-ons may have additional charges which will be communicated upfront.",
    },
  ]
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return [
    { name: "Entire Noida" },
    { name: "Indirapuram" },
    { name: "Vasundhara" },
    { name: "Vaishali" },
    { name: "Crossing Republik" },
    { name: "Greater Noida West" },
    { name: "Mayur Vihar Ph - 1,2&3" },
    { name: "Ashok Vihar" },
    { name: "East Kailash" },
    { name: "Patparganj" },
    { name: "Okhla" },
    { name: "Jasola Vihar" },
    { name: "New Friends Colony" },
    { name: "Shaheen Bagh" },
  ]
}

export async function getCtaData() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return {
    title: "Ready to Get Your Blouse Stitched?",
    description: "Book now and enjoy free doorstep pickup & delivery in Indirapuram. Your perfect blouse is just a click away.",
    ctaText: "Book Stitching Now",
  }
}
