import { Link } from "react-router-dom";
import { MapPin, Star, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data - would come from Firestore
const featuredListings = [
  {
    id: "1",
    title: "Professional DJ Equipment Set",
    type: "item",
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
    type: "item",
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
    type: "item",
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
    type: "item",
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
    type: "service",
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
    type: "service",
    category: "Music & Audio",
    price: 3500,
    priceUnit: "event",
    location: "Cape Town, Claremont",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    owner: { name: "David O.", avatar: "https://i.pravatar.cc/100?img=15" },
  },
];

const FeaturedListings = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured Listings
            </h2>
            <p className="text-muted-foreground">
              Handpicked items and services from verified owners
            </p>
          </div>
          <Button variant="tealOutline" asChild>
            <Link to="/browse">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <Link
              key={listing.id}
              to={`/listing/${listing.id}`}
              className="group bg-card rounded-2xl overflow-hidden card-elevated"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={cn(
                    "text-xs font-medium",
                    listing.type === "item" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"
                  )}>
                    {listing.type === "item" ? "Item" : "Service"}
                  </Badge>
                </div>

                {/* Save Button */}
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm">
                  <span className="font-bold text-foreground">R{listing.price.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm">/{listing.priceUnit}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-secondary transition-colors line-clamp-1">
                  {listing.title}
                </h3>

                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{listing.location}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <img
                      src={listing.owner.avatar}
                      alt={listing.owner.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-muted-foreground">{listing.owner.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-sm">{listing.rating}</span>
                    <span className="text-muted-foreground text-sm">({listing.reviews})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
