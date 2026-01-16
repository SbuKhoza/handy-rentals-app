import { Link } from "react-router-dom";
import { 
  Car, Tent, Camera, Wrench, Music, Bike, 
  Laptop, Sofa, Shirt, Gamepad, Dumbbell, ChefHat 
} from "lucide-react";

const categories = [
  { id: "vehicles", name: "Vehicles", icon: Car, color: "bg-blue-500/10 text-blue-600" },
  { id: "camping", name: "Camping", icon: Tent, color: "bg-green-500/10 text-green-600" },
  { id: "photography", name: "Photography", icon: Camera, color: "bg-purple-500/10 text-purple-600" },
  { id: "tools", name: "Tools", icon: Wrench, color: "bg-orange-500/10 text-orange-600" },
  { id: "music", name: "Music & Audio", icon: Music, color: "bg-pink-500/10 text-pink-600" },
  { id: "sports", name: "Sports", icon: Bike, color: "bg-cyan-500/10 text-cyan-600" },
  { id: "electronics", name: "Electronics", icon: Laptop, color: "bg-indigo-500/10 text-indigo-600" },
  { id: "furniture", name: "Furniture", icon: Sofa, color: "bg-amber-500/10 text-amber-600" },
  { id: "fashion", name: "Fashion", icon: Shirt, color: "bg-rose-500/10 text-rose-600" },
  { id: "gaming", name: "Gaming", icon: Gamepad, color: "bg-violet-500/10 text-violet-600" },
  { id: "fitness", name: "Fitness", icon: Dumbbell, color: "bg-red-500/10 text-red-600" },
  { id: "kitchen", name: "Kitchen", icon: ChefHat, color: "bg-teal-500/10 text-teal-600" },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From power tools to party equipment, find exactly what you need from local owners.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="group flex flex-col items-center gap-3 p-4 md:p-6 rounded-2xl bg-card hover:bg-muted transition-all duration-300 card-elevated"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${category.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
