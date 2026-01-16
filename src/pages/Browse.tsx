import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SearchFilters from "@/components/listings/SearchFilters";
import ListingCard from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data
const allListings = [
  {
    id: "1",
    title: "Professional DJ Equipment Set",
    type: "item" as const,
    category: "Music & Audio",
    price: 850,
    priceUnit: "day",
    location: "Johannesburg, Sandton",
    rating: 4.9,
    reviews: 28,
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    owner: { name: "Marcus T.", avatar: "https://i.pravatar.cc/100?img=11" },
  },
  {
    id: "2",
    title: "4x4 Camping Trailer with Tent",
    type: "item" as const,
    category: "Camping",
    price: 650,
    priceUnit: "day",
    location: "Cape Town, Century City",
    rating: 4.8,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
    owner: { name: "Sarah M.", avatar: "https://i.pravatar.cc/100?img=5" },
  },
  {
    id: "3",
    title: "Canon EOS R5 Camera Kit",
    type: "item" as const,
    category: "Photography",
    price: 1200,
    priceUnit: "day",
    location: "Durban, Umhlanga",
    rating: 5.0,
    reviews: 19,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop",
    owner: { name: "James K.", avatar: "https://i.pravatar.cc/100?img=12" },
  },
  {
    id: "4",
    title: "Professional Pressure Washer",
    type: "item" as const,
    category: "Tools",
    price: 350,
    priceUnit: "day",
    location: "Pretoria, Menlyn",
    rating: 4.7,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    owner: { name: "Peter V.", avatar: "https://i.pravatar.cc/100?img=8" },
  },
  {
    id: "5",
    title: "Event Photography Services",
    type: "service" as const,
    category: "Photography",
    price: 2500,
    priceUnit: "event",
    location: "Johannesburg, Rosebank",
    rating: 4.9,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&h=400&fit=crop",
    owner: { name: "Lisa N.", avatar: "https://i.pravatar.cc/100?img=9" },
  },
  {
    id: "6",
    title: "Mobile DJ & MC Services",
    type: "service" as const,
    category: "Music & Audio",
    price: 3500,
    priceUnit: "event",
    location: "Cape Town, Claremont",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    owner: { name: "David O.", avatar: "https://i.pravatar.cc/100?img=15" },
  },
  {
    id: "7",
    title: "Mountain Bike - Trek Fuel EX",
    type: "item" as const,
    category: "Sports",
    price: 400,
    priceUnit: "day",
    location: "Stellenbosch",
    rating: 4.6,
    reviews: 23,
    image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=600&h=400&fit=crop",
    owner: { name: "Andre P.", avatar: "https://i.pravatar.cc/100?img=13" },
  },
  {
    id: "8",
    title: "Projector & Screen Set",
    type: "item" as const,
    category: "Electronics",
    price: 500,
    priceUnit: "day",
    location: "Johannesburg, Fourways",
    rating: 4.9,
    reviews: 41,
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop",
    owner: { name: "Thandi M.", avatar: "https://i.pravatar.cc/100?img=16" },
  },
  {
    id: "9",
    title: "Personal Training Sessions",
    type: "service" as const,
    category: "Fitness",
    price: 450,
    priceUnit: "session",
    location: "Cape Town, Sea Point",
    rating: 5.0,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
    owner: { name: "Mike R.", avatar: "https://i.pravatar.cc/100?img=3" },
  },
];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [listings] = useState(allListings);

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  return (
    <Layout>
      <div className="pt-16 md:pt-20 min-h-screen bg-background">
        {/* Search & Filters */}
        <SearchFilters
          onSearch={(query) => console.log("Search:", query)}
          onLocationChange={(location) => console.log("Location:", location)}
          onFiltersChange={(filters) => console.log("Filters:", filters)}
        />

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {initialQuery ? `Results for "${initialQuery}"` : "All Listings"}
              </h1>
              <p className="text-muted-foreground">
                {listings.length} {listings.length === 1 ? "listing" : "listings"} found
              </p>
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          <div className={cn(
            "grid gap-6 pb-24",
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 max-w-3xl"
          )}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center py-8">
            <Button variant="outline" size="lg">
              Load More Listings
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Browse;
