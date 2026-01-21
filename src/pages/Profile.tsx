import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Calendar, Edit2 } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Not logged in</h2>
              <p className="text-muted-foreground mb-6">Sign in to view your profile</p>
              <Button variant="teal" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-6 card-elevated mb-6">
            <div className="flex items-start gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Profile"}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-10 h-10 text-secondary-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {user.displayName || "User"}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Recently"}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl p-4 text-center card-elevated">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Listings</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center card-elevated">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Rentals</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center card-elevated">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </div>

          {/* My Listings */}
          <div className="bg-card rounded-2xl p-6 card-elevated">
            <h3 className="text-lg font-semibold text-foreground mb-4">My Listings</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't created any listings yet.</p>
              <Button variant="teal" className="mt-4" asChild>
                <Link to="/create-listing">Create Your First Listing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
