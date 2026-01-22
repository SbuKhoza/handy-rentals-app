'use client';

import React from "react"

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Loader2,
  X,
  Check,
  Trash2,
  MessageCircle,
  Pencil,
  ImageIcon,
  Upload,
  Camera,
} from "lucide-react";
import { useFirestoreCRUD, where } from "../hooks/useFirestoreCRUD";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import type { Listing, UserProfile, Rental, Review } from "../types";
import { db, storage } from "../lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Simple Listing Card for Profile (with edit/delete)
interface ProfileListingCardProps {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
}

const ProfileListingCard = ({
  listing,
  onEdit,
  onDelete,
}: ProfileListingCardProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this listing? This action cannot be undone."
      )
    ) {
      return;
    }
    setDeleting(true);
    onDelete(listing);
  };

  return (
    <div className="bg-card rounded-xl border overflow-hidden group">
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          <img
            src={listing.images?.[0] || "/placeholder.jpg"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                listing.type === "item"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {listing.type === "item" ? "Item" : "Service"}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/listing/${listing.id}`}>
          <h4 className="font-medium text-foreground truncate hover:text-primary transition-colors">
            {listing.title}
          </h4>
        </Link>
        <p className="text-sm text-muted-foreground">{listing.location}</p>
        <p className="text-sm font-semibold text-foreground mt-1">
          R{listing.price}/{listing.priceUnit || "day"}
        </p>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => onEdit(listing)}
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Edit Listing Modal
interface EditListingModalProps {
  listing: Listing;
  onClose: () => void;
  onSave: (updatedListing: Partial<Listing>, newImages?: File[]) => Promise<void>;
}

const EditListingModal = ({ listing, onClose, onSave }: EditListingModalProps) => {
  const [formData, setFormData] = useState({
    title: listing.title || "",
    description: listing.description || "",
    price: listing.price || 0,
    priceUnit: listing.priceUnit || "day",
    location: listing.location || "",
    availability: listing.availability || "",
  });
  const [existingImages, setExistingImages] = useState<string[]>(
    listing.images || []
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit total images to 5
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      alert("You can only have up to 5 images per listing");
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave(
        {
          ...formData,
          images: existingImages,
        },
        newImages
      );
      onClose();
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("Failed to save listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Listing</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Images (up to 5)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {/* Existing Images */}
              {existingImages.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Listing ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* New Image Previews */}
              {newImagePreviews.map((preview, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden border border-primary"
                >
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-1 rounded">
                    New
                  </span>
                </div>
              ))}

              {/* Add Image Button */}
              {existingImages.length + newImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Listing title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your item or service..."
              rows={4}
              required
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (R)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Per</label>
              <select
                value={formData.priceUnit}
                onChange={(e) =>
                  setFormData({ ...formData, priceUnit: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="City, Area"
              required
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Availability
            </label>
            <Input
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
              placeholder="e.g., Weekdays 9am-5pm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Profile Modal
interface EditProfileModalProps {
  profile: UserProfile | null;
  user: any;
  onClose: () => void;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

const EditProfileModal = ({
  profile,
  user,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    userName: profile?.userName || "",
    displayName: profile?.displayName || user?.displayName || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-md">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
              <span className="text-muted-foreground ml-1">(unique identifier)</span>
            </label>
            <Input
              value={formData.userName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userName: e.target.value.toLowerCase().replace(/\s/g, ""),
                })
              }
              placeholder="yourname"
              pattern="^[a-z0-9_]+$"
              title="Only lowercase letters, numbers, and underscores allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only lowercase letters, numbers, and underscores
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <Input
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              placeholder="Your full name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell others about yourself..."
              rows={3}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+27 123 456 7890"
              type="tel"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="City, Province"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [stats, setStats] = useState({
    listings: 0,
    rentals: 0,
    reviews: 0,
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const profileApi = useFirestoreCRUD<UserProfile>({
    collectionName: "profiles",
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
  const { data: userListings, loading: listingsLoading } =
    useFirestoreCollection<Listing>({
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
            userId: user.uid,
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

  // Save profile handler
  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    await profileApi.update(user.uid, {
      ...data,
      updatedAt: new Date(),
    });

    // Refresh profile
    const updatedProfile = await profileApi.getById(user.uid);
    setUserProfile(updatedProfile);
  };

  // Save listing handler
  const handleSaveListing = async (
    updatedData: Partial<Listing>,
    newImages?: File[]
  ) => {
    if (!editingListing?.id || !user) return;

    let allImages = updatedData.images || [];

    // Upload new images if any
    if (newImages && newImages.length > 0) {
      const uploadPromises = newImages.map(async (file) => {
        const storageRef = ref(
          storage,
          `listings/${editingListing.id}/${Date.now()}_${file.name}`
        );
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      allImages = [...allImages, ...uploadedUrls];
    }

    await listingsApi.update(editingListing.id, {
      ...updatedData,
      images: allImages,
      updatedAt: new Date(),
    });
  };

  // Delete listing handler
  const handleDeleteListing = async (listing: Listing) => {
    if (!listing.id) return;

    try {
      // Delete images from storage
      if (listing.images && listing.images.length > 0) {
        const deletePromises = listing.images.map(async (imageUrl) => {
          try {
            // Extract path from URL and delete
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (e) {
            // Image might already be deleted or not exist
            console.log("Could not delete image:", e);
          }
        });
        await Promise.allSettled(deletePromises);
      }

      // Delete the listing document
      await listingsApi.remove(listing.id);
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    }
  };

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

  const displayName =
    userProfile?.userName ||
    userProfile?.displayName ||
    user.displayName ||
    "User";

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link to="/messages">
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </Link>
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex items-start gap-4">
              {user.photoURL || userProfile?.photoURL ? (
                <img
                  src={user.photoURL || userProfile?.photoURL}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-10 h-10 text-secondary-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {displayName}
                </h2>
                {userProfile?.userName && (
                  <p className="text-sm text-muted-foreground">
                    @{userProfile.userName}
                  </p>
                )}
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {user.metadata.creationTime
                      ? new Date(
                          user.metadata.creationTime
                        ).toLocaleDateString()
                      : userProfile?.createdAt
                        ? (userProfile.createdAt instanceof Date 
                            ? userProfile.createdAt 
                            : userProfile.createdAt.toDate()
                          ).toLocaleDateString()
                        : "Recently"}
                  </span>
                </div>
                {userProfile?.bio && (
                  <p className="text-muted-foreground mt-2">{userProfile.bio}</p>
                )}
                {userProfile?.location && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {userProfile.location}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                onClick={() => setEditingProfile(true)}
              >
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
              <Button variant="outline" size="sm" className="bg-transparent" asChild>
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
                  <ProfileListingCard
                    key={listing.id}
                    listing={listing}
                    onEdit={(l) => setEditingListing(l)}
                    onDelete={handleDeleteListing}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <EditProfileModal
          profile={userProfile}
          user={user}
          onClose={() => setEditingProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Edit Listing Modal */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSave={handleSaveListing}
        />
      )}
    </Layout>
  );
};

export default Profile;
