import { useCMS } from "@/contexts/CMSContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, Package, Users, Coins, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { categories, listings, users, tokenPackages } = useCMS();

  const stats = [
    {
      title: "Categories",
      value: categories.filter(c => c.isActive).length,
      total: categories.length,
      icon: FolderTree,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Listings",
      value: listings.filter(l => l.isActive).length,
      total: listings.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Users",
      value: users.filter(u => u.isActive).length,
      total: users.length,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      title: "Token Packages",
      value: tokenPackages.filter(p => p.isActive).length,
      total: tokenPackages.length,
      icon: Coins,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  const featuredListings = listings.filter(l => l.isFeatured && l.isActive);
  const recentListings = [...listings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to the Rent4Hire Content Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.total} total ({stat.total - stat.value} inactive)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Featured Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <CardTitle>Featured Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featuredListings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No featured listings</p>
              ) : (
                featuredListings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="flex items-center gap-3">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary">
                      R{listing.price}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" />
            <CardTitle>Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentListings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No listings yet</p>
              ) : (
                recentListings.map((listing) => (
                  <div key={listing.id} className="flex items-center gap-3">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      listing.isActive 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {listing.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Categories Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {categories.filter(c => c.isActive).slice(0, 8).map((category) => {
              const count = listings.filter(l => l.category === category.name && l.isActive).length;
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{count} listings</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
