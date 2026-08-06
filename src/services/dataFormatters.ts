import {
  Category,
  INavbar,
  JourneyStep,
  Testimonial,
  VideoCard,
} from "@/types/interface";

// Function to ensure navbar object has all required fields
export const ensureNavbarFormat = (navbarData: any): INavbar => {
  // Make sure all navItems have a submenu property (null if not defined)
  const navItems = navbarData.navItems.map((item: any) => ({
    ...item,
    submenu: item.submenu || null,
  }));

  return {
    ...navbarData,
    navItems,
  };
};

// Ensure JourneyStep has the required properties
export const ensureJourneyStepsFormat = (journey: any) => {
  const steps = journey.data.map((step: any) => {
    // Create a valid JourneyStep with optional icon and imageUrl
    return {
      id: step.id,
      ...(step.icon ? { icon: step.icon } : {}),
      ...(step.imageUrl ? { imageUrl: step.imageUrl } : {}),
      title: step.title,
      description: step.description,
    };
  });

  return {
    ...journey,
    steps,
  };
};

// Ensure Categories have the image property
export const ensureCategoriesFormat = (categories: any[]) => {
  return categories.map((category: any) => {
    // First create a complete category object with both image and imageUrl
    const completeCategory = {
      ...category,
      image: category.image || category.imageUrl || "",
      imageUrl: category.imageUrl || category.image || "",
      styles: category.styles || [],
    };

    // Return as Category type
    return completeCategory as Category;
  });
};

// Ensure VideoCards have the videoId property
export const ensureVideosFormat = (videos: any[]) => {
  return videos.map((video: any) => ({
    ...video,
    videoId: video.videoId || video.videoUrl || "", // Default empty string if not provided
  }));
};

// Ensure Testimonials have message and position
export const ensureTestimonialsFormat = (testimonials: any[]) => {
  return testimonials.map((testimonial: any) => ({
    ...testimonial,
    message: testimonial.message || testimonial.quote || "",
    position: testimonial.position || testimonial.role || "",
  }));
};
