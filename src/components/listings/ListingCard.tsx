import { Link } from "react-router-dom";
import { MapPin, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ListingCardProps {
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
  owner: {
    name: string;
    avatar: string;
  };
}

const ListingCard = ({
  id,
  title,
  type,
  category,
  price,
  priceUnit,
  location,
  rating,
  reviews,
  image,
  owner,
}: ListingCardProps) => {
  return (
    <Link
      to={`/listing/${id}`}
      className="group bg-card rounded-2xl overflow-hidden card-elevated"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={cn(
            "text-xs font-medium",
            type === "item" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"
          )}>
            {type === "item" ? "Item" : "Service"}
          </Badge>
        </div>

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // Handle save
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm">
          <span className="font-bold text-foreground">R{price.toLocaleString()}</span>
          <span className="text-muted-foreground text-sm">/{priceUnit}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-secondary transition-colors line-clamp-1">
          {title}
        </h3>

        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <img
              src={owner.avatar}
              alt={owner.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground">{owner.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium text-sm">{rating}</span>
            <span className="text-muted-foreground text-sm">({reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
