import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onLocationChange: (location: string) => void;
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
  type: "all" | "item" | "service";
  category: string;
  priceMin: string;
  priceMax: string;
}

const categories = [
  "All Categories",
  "Vehicles",
  "Camping",
  "Photography",
  "Tools",
  "Music & Audio",
  "Sports",
  "Electronics",
  "Furniture",
  "Fashion",
  "Gaming",
  "Fitness",
  "Kitchen",
];

const SearchFilters = ({ onSearch, onLocationChange, onFiltersChange }: SearchFiltersProps) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    category: "All Categories",
    priceMin: "",
    priceMax: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      type: "all",
      category: "All Categories",
      priceMin: "",
      priceMax: "",
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.type !== "all" || 
    filters.category !== "All Categories" || 
    filters.priceMin || 
    filters.priceMax;

  return (
    <div className="bg-card border-b border-border sticky top-16 md:top-20 z-40">
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-muted rounded-xl border border-border focus-within:border-secondary transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items and services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl border border-border focus-within:border-secondary transition-colors md:w-56">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                onLocationChange(e.target.value);
              }}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="teal" className="flex-1 md:flex-none">
              Search
            </Button>
            <Button
              type="button"
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline">Filters</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full" />
              )}
            </Button>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/50 rounded-xl animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Type</label>
                <div className="flex gap-2">
                  {["all", "item", "service"].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateFilter("type", type as FilterState["type"])}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
                        filters.type === type
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {type === "all" ? "All" : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="w-full px-3 py-2 bg-card rounded-lg text-foreground border border-border appearance-none pr-10 focus:outline-none focus:border-secondary"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-2">Price Range (ZAR)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => updateFilter("priceMin", e.target.value)}
                    className="flex-1 px-3 py-2 bg-card rounded-lg text-foreground border border-border focus:outline-none focus:border-secondary"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => updateFilter("priceMax", e.target.value)}
                    className="flex-1 px-3 py-2 bg-card rounded-lg text-foreground border border-border focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && !showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.type !== "all" && (
              <Badge variant="secondary" className="gap-1 capitalize">
                {filters.type}
                <button onClick={() => updateFilter("type", "all")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.category !== "All Categories" && (
              <Badge variant="secondary" className="gap-1">
                {filters.category}
                <button onClick={() => updateFilter("category", "All Categories")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <Badge variant="secondary" className="gap-1">
                R{filters.priceMin || "0"} - R{filters.priceMax || "∞"}
                <button onClick={() => { updateFilter("priceMin", ""); updateFilter("priceMax", ""); }}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
