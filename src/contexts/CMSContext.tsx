import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Category, Listing, User, TokenPackage, ListingPricing, SiteContent } from "@/types/cms";
import {
  defaultCategories,
  defaultListings,
  defaultTokenPackages,
  defaultListingPricing,
  defaultUsers,
  defaultSiteContent,
} from "@/lib/cms-data";

interface CMSContextType {
  // Data
  categories: Category[];
  listings: Listing[];
  users: User[];
  tokenPackages: TokenPackage[];
  listingPricing: ListingPricing[];
  siteContent: SiteContent[];
  
  // Category CRUD
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Listing CRUD
  addListing: (listing: Omit<Listing, "id" | "createdAt" | "updatedAt">) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  
  // User CRUD
  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Token Package CRUD
  addTokenPackage: (pkg: Omit<TokenPackage, "id" | "createdAt" | "updatedAt">) => void;
  updateTokenPackage: (id: string, updates: Partial<TokenPackage>) => void;
  deleteTokenPackage: (id: string) => void;
  
  // Listing Pricing CRUD
  updateListingPricing: (id: string, updates: Partial<ListingPricing>) => void;
  
  // Site Content CRUD
  updateSiteContent: (key: string, value: string) => void;
  getSiteContent: (key: string) => string;
  
  // Loading state
  isLoading: boolean;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  categories: "cms_categories",
  listings: "cms_listings",
  users: "cms_users",
  tokenPackages: "cms_token_packages",
  listingPricing: "cms_listing_pricing",
  siteContent: "cms_site_content",
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [listingPricing, setListingPricing] = useState<ListingPricing[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    setCategories(loadFromStorage(STORAGE_KEYS.categories, defaultCategories));
    setListings(loadFromStorage(STORAGE_KEYS.listings, defaultListings));
    setUsers(loadFromStorage(STORAGE_KEYS.users, defaultUsers));
    setTokenPackages(loadFromStorage(STORAGE_KEYS.tokenPackages, defaultTokenPackages));
    setListingPricing(loadFromStorage(STORAGE_KEYS.listingPricing, defaultListingPricing));
    setSiteContent(loadFromStorage(STORAGE_KEYS.siteContent, defaultSiteContent));
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(STORAGE_KEYS.categories, categories);
    }
  }, [categories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage(STORAGE_KEYS.listings, listings);
    }
  }, [listings, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage(STORAGE_KEYS.users, users);
    }
  }, [users, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage(STORAGE_KEYS.tokenPackages, tokenPackages);
    }
  }, [tokenPackages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage(STORAGE_KEYS.listingPricing, listingPricing);
    }
  }, [listingPricing, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage(STORAGE_KEYS.siteContent, siteContent);
    }
  }, [siteContent, isLoading]);

  // Category CRUD
  const addCategory = useCallback((category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setCategories(prev => [...prev, { ...category, id: generateId(), createdAt: now, updatedAt: now }]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat
    ));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, []);

  // Listing CRUD
  const addListing = useCallback((listing: Omit<Listing, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setListings(prev => [...prev, { ...listing, id: generateId(), createdAt: now, updatedAt: now }]);
  }, []);

  const updateListing = useCallback((id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    ));
  }, []);

  const deleteListing = useCallback((id: string) => {
    setListings(prev => prev.filter(item => item.id !== id));
  }, []);

  // User CRUD
  const addUser = useCallback((user: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setUsers(prev => [...prev, { ...user, id: generateId(), createdAt: now, updatedAt: now }]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
    ));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  // Token Package CRUD
  const addTokenPackage = useCallback((pkg: Omit<TokenPackage, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setTokenPackages(prev => [...prev, { ...pkg, id: generateId(), createdAt: now, updatedAt: now }]);
  }, []);

  const updateTokenPackage = useCallback((id: string, updates: Partial<TokenPackage>) => {
    setTokenPackages(prev => prev.map(pkg => 
      pkg.id === id ? { ...pkg, ...updates, updatedAt: new Date().toISOString() } : pkg
    ));
  }, []);

  const deleteTokenPackage = useCallback((id: string) => {
    setTokenPackages(prev => prev.filter(pkg => pkg.id !== id));
  }, []);

  // Listing Pricing CRUD
  const updateListingPricing = useCallback((id: string, updates: Partial<ListingPricing>) => {
    setListingPricing(prev => prev.map(pricing => 
      pricing.id === id ? { ...pricing, ...updates, updatedAt: new Date().toISOString() } : pricing
    ));
  }, []);

  // Site Content CRUD
  const updateSiteContent = useCallback((key: string, value: string) => {
    setSiteContent(prev => {
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item => 
          item.key === key ? { ...item, value, updatedAt: new Date().toISOString() } : item
        );
      }
      return [...prev, { id: generateId(), key, value, type: "text", section: "custom", updatedAt: new Date().toISOString() }];
    });
  }, []);

  const getSiteContent = useCallback((key: string): string => {
    return siteContent.find(item => item.key === key)?.value || "";
  }, [siteContent]);

  const value: CMSContextType = {
    categories,
    listings,
    users,
    tokenPackages,
    listingPricing,
    siteContent,
    addCategory,
    updateCategory,
    deleteCategory,
    addListing,
    updateListing,
    deleteListing,
    addUser,
    updateUser,
    deleteUser,
    addTokenPackage,
    updateTokenPackage,
    deleteTokenPackage,
    updateListingPricing,
    updateSiteContent,
    getSiteContent,
    isLoading,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
}
