import { Timestamp } from "firebase/firestore";

export interface Listing {
  id?: string;
  title: string;
  description: string;
  type: "item" | "service";
  category: string;
  categoryId: string;
  price: number;
  priceUnit: string;
  location: string;
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  status: "active" | "inactive" | "expired";
  rating: number;
  reviews: number;
  reviewsCount?: number;
  categoryName?: string;
  availability?: string;
  rules?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp | Date;
  expiresAt?: Timestamp;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  slug: string;
  order?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserProfile {
  id?: string;
  uid?: string;
  userId?: string;
  email: string;
  userName?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  phone?: string;
  verified?: boolean;
  rating?: number;
  reviewsCount?: number;
  responseTime?: string;
  listingsCount?: number;
  rentalsCount?: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Review {
  id?: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
}

export interface Rental {
  id?: string;
  listingId: string;
  listingTitle: string;
  renterId: string;
  renterName: string;
  ownerId: string;
  ownerName: string;
  startDate: Timestamp;
  endDate: Timestamp;
  totalPrice: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TokenTransaction {
  id?: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference?: string;
  createdAt?: Timestamp;
}

export interface TokenWallet {
  id?: string;
  userId: string;
  balance: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  popular?: boolean;
}
