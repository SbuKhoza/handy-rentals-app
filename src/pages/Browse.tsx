'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import SearchFilters from "../components/listings/SearchFilters";
import ListingCard from "../components/listings/ListingCard";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useFirestoreCRUD, orderBy, where } from "../hooks/useFirestoreCRUD";
import type { Listing, Category } from "../types";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  // Fetch listings from Firestore with real-time updates
  const { 
    data: listings, 
    loading: listingsLoading, 
    error: listingsError 
  } = useFirestoreCollection<Listing>({
    collectionName: "listings",
    constraints: [orderBy("createdAt", "desc")],
    realtime: true,
  });

  // Fetch categories for filtering
  const categoriesApi = useFirestoreCRUD<Category>({ collectionName: "categories" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll([orderBy("order", "asc")]);
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Filter listings based on search params
  useEffect(() => {
    let filtered = [...listings];

    // Filter by search query
    if (initialQuery) {
      const query = initialQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (initialCategory) {
      filtered = filtered.filter(
        (listing) =>
          listing.category.toLowerCase() === initialCategory.toLowerCase() ||
          listing.categoryId === initialCategory
      );
    }

    // Only show active listings
    filtered = filtered.filter(
      (listing) => !listing.status || listing.status === "active"
    );

    setFilteredListings(filtered);
  }, [listings, initialQuery, initialCategory]);

  const handleSearch = (query: string) => {
    const searchLower = query.toLowerCase();
    const filtered = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description?.toLowerCase().includes(searchLower)
    );
    setFilteredListings(filtered);
  };

  const handleFiltersChange = (filters: {
    type?: string;
    priceRange?: [number, number];
    category?: string;
  }) => {
    let filtered = [...listings];

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((listing) => listing.type === filters.type);
    }

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (listing) =>
          listing.category === filters.category ||
          listing.categoryId === filters.category
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (listing) =>
          listing.price >= filters.priceRange![0] &&
          listing.price <= filters.priceRange![1]
      );
    }

    setFilteredListings(filtered);
  };

  if (listingsError) {
    return (
      <Layout>
        <div className="pt-16 md:pt-20 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-destructive">
              Failed to load listings. Please try again later.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-16 md:pt-20 min-h-screen bg-background">
        {/* Search & Filters */}
        <SearchFilters
          onSearch={handleSearch}
          onLocationChange={(location) => console.log("Location:", location)}
          onFiltersChange={handleFiltersChange}
        />

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {initialQuery
                  ? `Results for "${initialQuery}"`
                  : initialCategory
                  ? `${initialCategory} Listings`
                  : "All Listings"}
              </h1>
              <p className="text-muted-foreground">
                {filteredListings.length}{" "}
                {filteredListings.length === 1 ? "listing" : "listings"} found
              </p>
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-card shadow-sm"
                    : "hover:bg-card/50"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-card shadow-sm"
                    : "hover:bg-card/50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {listingsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading listings...
              </span>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No listings found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              {/* Listings Grid */}
              <div
                className={cn(
                  "grid gap-6 pb-24",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 max-w-3xl"
                )}
              >
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id || ""}
                    title={listing.title}
                    type={listing.type}
                    category={listing.category}
                    price={listing.price}
                    priceUnit={listing.priceUnit}
                    location={listing.location}
                    rating={listing.rating || 0}
                    reviews={listing.reviews || 0}
                    image={listing.images?.[0] || "/placeholder.jpg"}
                    owner={{
                      name: listing.ownerName || "Owner",
                      avatar: listing.ownerAvatar,
                    }}
                  />
                ))}
              </div>

              {/* Load More - could implement pagination */}
              {filteredListings.length >= 12 && (
                <div className="text-center py-8">
                  <Button variant="outline" size="lg">
                    Load More Listings
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Browse;
