// CMS Types - Ready for Firebase/Firestore integration

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
  type: "item" | "service";
  category: string;
  price: number;
  priceUnit: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  description?: string;
  rules?: string[];
  owner: {
    id?: string;
    name: string;
    avatar: string;
    phone?: string;
    email?: string;
    responseRate?: number;
    memberSince?: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: "user" | "admin";
  tokenBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  isPopular: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  type: "purchase" | "spend" | "refund";
  amount: number;
  description: string;
  listingId?: string;
  packageId?: string;
  createdAt: string;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: "text" | "html" | "image" | "json";
  section: string;
  updatedAt: string;
}

export interface ListingPricing {
  id: string;
  categoryId: string;
  tokensRequired: number;
  durationDays: number;
  renewalTokens: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
