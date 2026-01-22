'use client';

import React from "react"

import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  Calendar,
  Shield,
  Clock,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  ImageOff,
  Pencil,
  Trash2,
  X,
  Upload,
  ImageIcon,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";
import { useFirestoreCRUD, where } from "../hooks/useFirestoreCRUD";
import { useAuth } from "../contexts/AuthContext";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { Listing, Review, UserProfile } from "../types";

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentImage, setCurrentImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    priceUnit: "day",
    location: "",
    availability: "",
    rules: [] as string[],
  });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const listingsApi = useFirestoreCRUD<Listing>({ collectionName: "listings" });
  const profilesApi = useFirestoreCRUD<UserProfile>({ collectionName: "profiles" });
  const reviewsApi = useFirestoreCRUD<Review>({ collectionName: "reviews" });

  useEffect(() => {
    const fetchListingData = async () => {
      if (!id) {
        setError("Listing ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const listingData = await listingsApi.getById(id);

        if (!listingData) {
          setError("Listing not found");
          setLoading(false);
          return;
        }

        setListing(listingData);

        if (listingData.ownerId) {
          const ownerData = await profilesApi.getById(listingData.ownerId);
          setOwner(ownerData);
        }

        const listingReviews = await reviewsApi.getAll([
          where("listingId", "==", id),
        ]);
        const sortedReviews = listingReviews.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setReviews(sortedReviews);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [id]);

  const isOwner = user && listing && user.uid === listing.ownerId;

  const openEditModal = () => {
    if (!listing) return;
    setEditForm({
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price || 0,
      priceUnit: listing.priceUnit || "day",
      location: listing.location || "",
      availability: listing.availability || "",
      rules: listing.rules || [],
    });
    setEditImages(listing.images || []);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user || !listing) return;

    if (editImages.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `listings/${listing.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const newUrls = await Promise.all(uploadPromises);
      setEditImages((prev) => [...prev, ...newUrls]);
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Failed to upload images");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      // Try to delete from storage if it's a Firebase URL
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch(() => {
          // Ignore if file doesn't exist
        });
      }
      setEditImages((prev) => prev.filter((img) => img !== imageUrl));
    } catch (err) {
      console.error("Error removing image:", err);
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setEditForm((prev) => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()],
      }));
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSaveEdit = async () => {
    if (!listing || !id) return;

    setSaving(true);
    try {
      await listingsApi.update(id, {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        priceUnit: editForm.priceUnit,
        location: editForm.location,
        availability: editForm.availability,
        rules: editForm.rules,
        images: editImages,
      });

      setListing((prev) =>
        prev
          ? {
              ...prev,
              ...editForm,
              images: editImages,
            }
          : null
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating listing:", err);
      alert("Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!listing || !id) return;

    setDeleting(true);
    try {
      // Delete images from storage
      if (listing.images?.length) {
        await Promise.all(
          listing.images.map(async (imageUrl) => {
            if (imageUrl.includes("firebasestorage.googleapis.com")) {
              const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef).catch(() => {});
            }
          })
        );
      }

      await listingsApi.remove(id);
      navigate("/profile");
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  };

  const nextImage = () => {
    if (listing?.images?.length) {
      setCurrentImage((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing?.images?.length) {
      setCurrentImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="pt-16 md:pt-20 pb-32 md:pb-16 min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading listing...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="pt-16 md:pt-20 pb-32 md:pb-16 min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <ImageOff className="w-12 h-12 text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">
              {error || "Listing not found"}
            </h1>
            <p className="text-muted-foreground">
              The listing you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/browse">Browse Listings</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const images = listing.images?.length ? listing.images : ["/placeholder.svg"];
  const rules = listing.rules || [];
  const priceUnit = listing.priceUnit || "day";

  return (
    <Layout>
      <div className="pt-16 md:pt-20 pb-32 md:pb-16 min-h-screen bg-background">
        {/* Image Gallery */}
        <div className="relative aspect-[16/10] md:aspect-[21/9] bg-muted overflow-hidden">
          <img
            src={images[currentImage] || "/placeholder.svg"}
            alt={listing.title}
            className="w-full h-full object-cover"
          />

          {/* Navigation */}
          {images.length > 1 && (
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
          )}

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentImage
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          )}

          {/* Back Button */}
          <Link
            to="/browse"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isOwner && (
              <>
                <button
                  onClick={openEditModal}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 transition-colors shadow-lg text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg",
                isSaved
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-white/90 hover:bg-white"
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
                  <Badge
                    className={cn(
                      listing.type === "item"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-accent text-accent-foreground"
                    )}
                  >
                    {listing.type === "item" ? "Item" : "Service"}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {listing.categoryName || listing.category}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                  {(listing.rating ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-foreground">
                        {listing.rating}
                      </span>
                      <span>({listing.reviewsCount || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Description
                </h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {listing.description}
                </div>
              </div>

              {/* Rental Rules */}
              {rules.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Rental Rules
                  </h2>
                  <ul className="space-y-3">
                    {rules.map((rule, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-muted-foreground"
                      >
                        <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Availability */}
              {listing.availability && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Availability
                  </h2>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    {listing.availability}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Reviews ({reviews.length})
                </h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-card rounded-xl p-4 border border-border"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={review.userAvatar || "/placeholder.svg"}
                            alt={review.userName || "User"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {review.userName || "Anonymous"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {review.createdAt
                                ? new Date(
                                    review.createdAt.seconds * 1000
                                  ).toLocaleDateString()
                                : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < (review.rating || 0)
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
                ) : (
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this listing!
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 border border-border sticky top-24 space-y-6">
                {/* Price */}
                <div className="text-center pb-6 border-b border-border">
                  <div className="text-3xl font-bold text-foreground">
                    R{(listing.price || 0).toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">per {priceUnit}</div>
                </div>

                {/* Owner */}
                {owner && (
                  <>
                    <div className="flex items-center gap-4">
                      <img
                        src={owner.photoURL || "/placeholder.svg"}
                        alt={owner.displayName || "Owner"}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {owner.displayName || "Owner"}
                          </span>
                          {owner.verified && (
                            <Shield className="w-4 h-4 text-secondary" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {(owner.rating ?? 0) > 0 && (
                            <>
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>{owner.rating}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{owner.reviewsCount || 0} reviews</span>
                        </div>
                      </div>
                    </div>

                    {owner.responseTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {owner.responseTime}
                      </div>
                    )}
                  </>
                )}

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={openEditModal}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}

                {/* CTA */}
                {user ? (
                  isOwner ? (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      This is your listing
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <Link
                        to={`/messages?listing=${listing.id}&owner=${listing.ownerId}`}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Contact Owner
                      </Link>
                    </Button>
                  )
                ) : (
                  <Button variant="default" size="lg" className="w-full" asChild>
                    <Link to={`/login?redirect=/listing/${listing.id}`}>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Owner
                    </Link>
                  </Button>
                )}

                {/* Messages Button */}
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full bg-transparent"
                    asChild
                  >
                    <Link to="/messages">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      View Messages
                    </Link>
                  </Button>
                )}

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

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Edit Listing</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Images ({editImages.length}/5)
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Listing ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(img)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {editImages.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-primary transition-colors"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Add</span>
                          </>
                        )}
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Listing title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe your listing"
                    rows={4}
                  />
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price (R)
                    </label>
                    <Input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price Unit
                    </label>
                    <select
                      value={editForm.priceUnit}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, priceUnit: e.target.value }))
                      }
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="hour">Per Hour</option>
                      <option value="day">Per Day</option>
                      <option value="week">Per Week</option>
                      <option value="month">Per Month</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <Input
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="City, Area"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Availability
                  </label>
                  <Input
                    value={editForm.availability}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, availability: e.target.value }))
                    }
                    placeholder="e.g., Weekdays 9am-5pm"
                  />
                </div>

                {/* Rules */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rental Rules
                  </label>
                  <div className="space-y-2 mb-3">
                    {editForm.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
                      >
                        <span className="flex-1 text-sm">{rule}</span>
                        <button
                          onClick={() => removeRule(idx)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="Add a rule"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRule();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addRule} className="bg-transparent">
                      Add
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Delete Listing
              </h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this listing? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListingDetails;
