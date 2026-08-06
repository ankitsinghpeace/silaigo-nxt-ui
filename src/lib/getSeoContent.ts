export function getSeoContent(categoryName) {

  if (!categoryName) return {
    h1: "Tailoring At Your Doorstep in 48 Hours | Silaigo",
    title: "Tailoring At Your Doorstep in 48 Hours | Silaigo",
    description: "Get your suits, kurtis & blouses stitched and delivered in just 48 hours. Silaigo offers doorstep tailoring with pickup and measurement in Noida."
  }

  const seoData = {
    "kurti": {
      h1: "Get Your Kurtis Tailored in Noida with 48-Hour Delivery",
      title: "Affordable Kurti Stitching in Noida – 48-Hour Delivery",
      description: "Tailor your perfect kurti with doorstep pickup & delivery in Noida. Get it ready in 48 hours at affordable prices."
    },
    "suits": {
      h1: "Doorstep Suit Stitching in Noida with 48-Hour Turnaround",
      title: "Women's Suit Tailoring in Noida – Pickup & Fast Delivery",
      description: "Custom suit stitching in Noida with free home pickup & 48-hour delivery. Affordable tailoring at your doorstep."
    },
    "blouse": {
      h1: "Blouse Stitching at Home in Noida – Ready in 48 Hours",
      title: "Affordable Blouse Tailoring in Noida with Doorstep Pickup",
      description: "Get designer blouses tailored in Noida with free home pickup & fast 48-hour delivery. Affordable & convenient."
    },
    "sharara_sets": {
      h1: "Sharara Set Tailoring with Free Pickup in Noida – Delivered in 2 Days",
      title: "Sharara Tailoring in Noida – Pickup & 48-Hour Delivery",
      description: "Perfect fit sharara sets tailored in Noida with doorstep pickup and 48-hour delivery. Affordable & hassle-free."
    },
    "coords_sets": {
      h1: "Fast & Affordable Co-ord Set Stitching in Noida",
      title: "Co-ord Set Tailoring – 48-Hour Delivery in Noida",
      description: "Tailor your co-ord sets in Noida with free home pickup & 48-hour delivery. Quick, affordable stitching service."
    },
    "dresses": {
      h1: "Get Your Dress Tailored in Noida – Pickup & Delivery in 48 Hours",
      title: "Dress Stitching in Noida – Affordable & Quick Tailoring",
      description: "Custom dress tailoring in Noida with doorstep pickup & 48-hour delivery. Affordable & perfect fit guaranteed."
    },
    "ready_to_wear_sarees": {
      h1: "Noida's Quickest Ready-to-Wear Saree Stitching with Free Pickup",
      title: "Ready-to-Wear Saree Tailoring in Noida – 48-Hour Service",
      description: "Ready-to-wear saree stitching in Noida with doorstep pickup and fast 48-hour delivery. Affordable & reliable."
    },
    "lehengas": {
      h1: "Bridal & Festive Lehengas Tailored Fast in Noida – Pickup Included",
      title: "Lehenga Tailoring in Noida – Pickup & 48-Hour Delivery",
      description: "Bridal & party lehenga tailoring in Noida with free home pickup & 48-hour delivery. Affordable and high quality."
    }
  };

  const formattedCategoryName = categoryName.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/ /g, '_');

  if (seoData[formattedCategoryName]) {
    return seoData[formattedCategoryName];
  } else {
    return {
      h1: `Doorstep ${categoryName} Stitching in Noida with 48-Hour Turnaround`,
      title: `Affordable ${categoryName} Stitching in Noida – 48-Hour Delivery`,
      description: `ailor your perfect ${categoryName} with doorstep pickup & delivery in Noida. Get it ready in 48 hours at affordable prices.`
    };
  }
}
