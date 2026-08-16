// interfaces.ts


import { ReactNode } from "react";
import { Gender, OrderStatus } from "./enums";

export interface HeroSlide {
  smImage: string;
  mdImage: string;
  lgImage: string;
  id: number;
  isActive: boolean;
  title: string;
  subtitle: string;
  link: string;
}

export interface JourneyStep {
  isActive: boolean;
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  link: string;
  linkType: string;
}

export interface Journey {
  title: string;
  subtitle: string;
  steps: JourneyStep[];
}

export interface Achievement {
  id: number;
  icon: string;
  value: string;
  label: string;
}

export interface Category {
  data: any;
  id: number;
  name: string;
  isActive: boolean;
  isVisibleOnHomePage: boolean;
  imageUrl: string;
  mImageUrl?: string;
  coverImageUrl: string;
  description: string;
  label?: any;
  rank: number;
  options: {
    title: string;
    discountedPrice: number;
    price: number;
  }[];
}

export interface CategoryStyle {
  id: number;
  name: string;
  image: string;
  description: string;
  keyAttributes: string[];
}

export interface VideoCard {
  id: number;
  videoUrl: string;
  title: string;
  thumbnail: string;
  description: string;
  isActive?: boolean;
}

export interface FNQ {
  id: number;
  isActive: boolean;
  question: string;
  answer: string;
}

export interface Team {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  isActive: boolean;
}

export interface INavbar {
  name: string;
  logo: string;
  items: NavItem[];
}

export interface NavItem {
  name: string;
  href: string;
  submenu?: { name: string; href: string }[] | null;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
  isActive: boolean;
}

export interface Subcategory {
  _id: string;
  name: string;
  image: string;
  description: string;
  categoryId: number;
  keyAttributes: string[];
  price?: number;
  discountedPrice?: number;
  label?: any;
  rank: number;
}

export interface CustomizationItem {
  id: number;
  title: string;
  imageUrl: string;
  complexity: string;
  _id?: string;
  price?: number;
  discountedPrice?: number;
}

export interface Customization {
  _id: string;
  type: string;
  options: CustomizationItem[];
  rank: number;
}

export interface IProfile {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: Date;
  email: string;
}

export interface IAddress {
  _id: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Slot {
  time: string;
  available: boolean;
  remaining: number;
}

export interface IOrder {
  _id?: string;
  status?: string;
  profile?: string;
}

export interface CustomizationBreakup {
  title: string;
  price: number;
  image: string;
  type: string;
  id: string;
}

export interface OrderDetailsProps {
  appointment?: {
    _id: string;
    date: string;
    time: string;
    status: OrderStatus;
    notes?: string;
  };
  order: {
    _id: string;
    status: OrderStatus;
    items: Array<{
      subCategory: string;
      subCategoryStyleId: number;
      customizations: any[];
      orderId?: string;
      _id: string;
    }>;
    imageUrls: string[];
    createdAt: string;
    notes?: string;
    /** Production lifecycle state — optional until always returned by the backend. */
    orderProcessingState?: string;
    /** Internal-only flag; never render alongside customer PII/urgency. */
    isReturnedForAlteration?: boolean;
  };
  payment: {
    status: OrderStatus;
    method?: string;
    _id: string;
    amount?: number;
    createdAt?: string;
    discountedAmount: number;
    coupon: string;
  };
  style: {
    name: string;
    image: string;
    price: number;
  };
  priceBreakup: {
    basePrice: number;
    total: number;
    customizations: CustomizationBreakup[];
  };
  address: IAddress & {
    name: string;
    phone: string;
  };
  measurements: any;
}

export interface CartItem {
  name: string;
  price: number;
  imageUrls: string[];
  productImage: string;
  returnUrl: string;
  timestamp: string;
  orderData: any;
}

export interface ContentPermissions {
  edit: boolean;
  view: boolean;
  create: boolean;
  delete: boolean;
}

export interface ScheduleConfig {
  _id?: string;
  name?: string;
  workingDays: string[];
  dailyHours: {
    startTime: string;
    endTime: string;
  };
  slotIntervalMinutes?: number;
  maxAppointmentsPerSlot?: number;
  isActive?: boolean;
}

export interface IAvailabilityOverride {
  _id?: string;
  date: Date;
  type: "HOLIDAY" | "CUSTOM";
  workingHours?: {
    startTime: string;
    endTime: string;
  };
  slots: Record<
    string,
    {
      isBlocked?: boolean;
      maxAppointments?: number;
    }
  >;
  reason?: string;
}

export interface IMetaMaster {
  _id?: string;
  type: string;
  subType: string;
  label: string;
  value?: any;
  isActive?: boolean;
  color?: string;
}

export interface IBlog {
  _id?: string;
  title: string;
  content: string;
  category: string;
  featuredImage: string;
  author: string;
  reactions: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

// Blog API response types
export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
  count: number;
  limit: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface BlogListResponse {
  blogs: IBlog[];
  pagination: BlogPagination;
  filters: Record<string, any>;
}

export interface IMeasurementField {
  id: string;
  name: string;
}

export interface IMeasurementCategory {
  name: string;
  label: string;
  fields: IMeasurementField[];
}

export interface InvoiceItem {
  name: string;
  unitCost: number;
  qty: number;
}

export interface CustomerInfo {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  phone: string;
}

export interface TotalsInfo {
  subtotal: number;
  tax: number;
  total: number;
  advance: number;
}

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  customer: CustomerInfo;
  items: InvoiceItem[];
  totals: TotalsInfo;
}

export type CreatePickupPayload = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pickupFor?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  scheduledPickupDate?: string;
  scheduledPickupTime?: string;
};
