"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Calendar, Edit2, Loader2 } from "lucide-react";
import { useFirestoreCRUD, orderBy, where } from "@/hooks/useFirestoreCRUD";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { Listing, UserProfile, Rental, Review } from "@/types";
import ListingCard from "@/components/listings/ListingCard";

const Profile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [stats, setStats] = useState({
    listings: 0,
    rentals: 0,
    reviews: 0,
  });

  const profileApi = useFirestoreCRUD<UserProfile>({
    collectionName: "users",
  });
  const listingsApi = useFirestoreCRUD<Listing>({
    collectionName: "listings",
  });
  const rentalsApi = useFirestoreCRUD<Rental>({
    collectionName: "rentals",
  });
  const reviewsApi = useFirestoreCRUD<Review>({
    collectionName: "reviews",
  });

  // Fetch user's listings with real-time updates
  const {
    data: userListings,
    loading: listingsLoading,
  } = useFirestoreCollection<Listing>({
    collectionName: "listings",
    constraints: user ? [where("ownerId", "==", user.uid)] : [],
    realtime: true,
  });

  // Fetch/create user profile
  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        // Try to get existing profile
        let profile = await profileApi.getById(user.uid);

        // If no profile exists, create one
        if (!profile) {
          await profileApi.set(user.uid, {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            listingsCount: 0,
            rentalsCount: 0,
            reviewsCount: 0,
          });
          profile = await profileApi.getById(user.uid);
        }

        setUserProfile(profile);

        // Fetch stats
        const [listings, rentals, reviews] = await Promise.all([
          listingsApi.getAll([where("ownerId", "==", user.uid)]),
          rentalsApi.getAll([where("renterId", "==", user.uid)]),
          reviewsApi.getAll([where("renterId", "==", user.uid)]),
        ]);

        setStats({
          listings: listings.length,
          rentals: rentals.length,
          reviews: reviews.length,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchOrCreateProfile();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Not logged in
              </h2>
              <p className="text-muted-foreground mb-6">
                Sign in to view your profile
              </p>
              <Button variant="default" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (profileLoading) {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading profile...
              </span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            My Profile
          </h1>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex items-start gap-4">
              {user.photoURL || userProfile?.photoURL ? (
                <img
                  src={user.photoURL || userProfile?.photoURL}
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
                  {user.displayName || userProfile?.displayName || "User"}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {user.metadata.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : userProfile?.createdAt
                      ? userProfile.createdAt.toDate().toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
                {userProfile?.bio && (
                  <p className="text-muted-foreground mt-2">
                    {userProfile.bio}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl p-4 text-center shadow-sm border">
              <p className="text-2xl font-bold text-foreground">
                {stats.listings}
              </p>
              <p className="text-sm text-muted-foreground">Listings</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center shadow-sm border">
              <p className="text-2xl font-bold text-foreground">
                {stats.rentals}
              </p>
              <p className="text-sm text-muted-foreground">Rentals</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center shadow-sm border">
              <p className="text-2xl font-bold text-foreground">
                {stats.reviews}
              </p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </div>

          {/* My Listings */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                My Listings
              </h3>
              <Button variant="outline" size="sm" asChild>
                <Link to="/create-listing">Add New</Link>
              </Button>
            </div>

            {listingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Loading listings...
                </span>
              </div>
            ) : userListings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't created any listings yet.</p>
                <Button variant="default" className="mt-4" asChild>
                  <Link to="/create-listing">Create Your First Listing</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userListings.map((listing) => (
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
                      name: listing.ownerName || "You",
                      avatar: listing.ownerAvatar,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
