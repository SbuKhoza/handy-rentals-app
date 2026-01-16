import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, Heart, Share2, MapPin, Star, Calendar, 
  Shield, Clock, MessageCircle, ChevronLeft, ChevronRight,
  User, Flag
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock listing data
const mockListing = {
  id: "1",
  title: "Professional DJ Equipment Set",
  type: "item",
  category: "Music & Audio",
  price: 850,
  priceUnit: "day",
  location: "Johannesburg, Sandton",
  rating: 4.9,
  reviews: 28,
  images: [
    "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&h=800&fit=crop",
  ],
  description: `Complete professional DJ setup perfect for events, parties, and weddings. This kit includes everything you need to throw an amazing party.

The set includes:
• Pioneer CDJ-2000NXS2 (x2)
• Pioneer DJM-900NXS2 Mixer
• QSC K12.2 Speakers (x2)
• Speaker stands and cables
• DJ headphones

All equipment is regularly maintained and in excellent condition. Setup assistance available upon request.`,
  rules: [
    "R2,000 refundable deposit required",
    "Must be returned clean and in original condition",
    "Responsible for any damage during rental period",
    "Pickup and dropoff in Sandton area only",
  ],
  availability: "Available most weekends. Contact to check specific dates.",
  owner: {
    id: "owner1",
    name: "Marcus Thompson",
    avatar: "https://i.pravatar.cc/200?img=11",
    rating: 4.9,
    reviews: 45,
    responseTime: "Usually responds within 1 hour",
    memberSince: "2022",
    verified: true,
  },
  createdAt: "2024-01-15",
};

const mockReviews = [
  {
    id: "r1",
    user: { name: "Sarah M.", avatar: "https://i.pravatar.cc/100?img=5" },
    rating: 5,
    comment: "Amazing equipment and Marcus was super helpful with setup tips. Will definitely rent again!",
    date: "2024-01-10",
  },
  {
    id: "r2",
    user: { name: "James K.", avatar: "https://i.pravatar.cc/100?img=12" },
    rating: 5,
    comment: "Perfect for our corporate event. Everything worked flawlessly.",
    date: "2024-01-05",
  },
  {
    id: "r3",
    user: { name: "Lisa N.", avatar: "https://i.pravatar.cc/100?img=9" },
    rating: 4,
    comment: "Great setup, easy communication. Sound quality was excellent.",
    date: "2023-12-28",
  },
];

const ListingDetails = () => {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const listing = mockListing;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <Layout>
      <div className="pt-16 md:pt-20 pb-32 md:pb-16 min-h-screen bg-background">
        {/* Image Gallery */}
        <div className="relative aspect-[16/10] md:aspect-[21/9] bg-muted overflow-hidden">
          <img
            src={listing.images[currentImage]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={prevImage}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Image Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {listing.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentImage ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"
                )}
              />
            ))}
          </div>

          {/* Back Button */}
          <Link
            to="/browse"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg",
                isSaved ? "bg-secondary text-secondary-foreground" : "bg-white/90 hover:bg-white"
              )}
            >
              <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn(
                    listing.type === "item" 
                      ? "bg-secondary text-secondary-foreground" 
                      : "bg-accent text-accent-foreground"
                  )}>
                    {listing.type === "item" ? "Item" : "Service"}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{listing.category}</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-foreground">{listing.rating}</span>
                    <span>({listing.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {listing.description}
                </div>
              </div>

              {/* Rental Rules */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Rental Rules</h2>
                <ul className="space-y-3">
                  {listing.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                      <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Availability */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Availability</h2>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  {listing.availability}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Reviews ({mockReviews.length})
                </h2>
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{review.user.name}</div>
                          <div className="text-sm text-muted-foreground">{review.date}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < review.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 border border-border sticky top-24 space-y-6">
                {/* Price */}
                <div className="text-center pb-6 border-b border-border">
                  <div className="text-3xl font-bold text-foreground">
                    R{listing.price.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">per {listing.priceUnit}</div>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-4">
                  <img
                    src={listing.owner.avatar}
                    alt={listing.owner.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{listing.owner.name}</span>
                      {listing.owner.verified && (
                        <Shield className="w-4 h-4 text-secondary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{listing.owner.rating}</span>
                      <span>•</span>
                      <span>{listing.owner.reviews} reviews</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {listing.owner.responseTime}
                </div>

                {/* CTA */}
                <Button variant="teal" size="lg" className="w-full" asChild>
                  <Link to={`/login?redirect=/listing/${listing.id}`}>
                    <MessageCircle className="w-5 h-5" />
                    Contact Owner
                  </Link>
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Agree on terms and pay the owner directly
                </p>

                {/* Report */}
                <button className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-destructive transition-colors">
                  <Flag className="w-4 h-4" />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetails;
