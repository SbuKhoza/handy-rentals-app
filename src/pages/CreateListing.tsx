"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Camera, Loader2, X, Coins, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCRUD, orderBy } from "@/hooks/useFirestoreCRUD";
import { Category, Listing, TokenWallet, TokenTransaction } from "@/types";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

const LISTING_DURATION_OPTIONS = [
  { days: 30, tokens: 1, label: "30 days" },
  { days: 60, tokens: 2, label: "60 days" },
  { days: 90, tokens: 3, label: "90 days" },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(LISTING_DURATION_OPTIONS[0]);

  const [formData, setFormData] = useState({
    title: "",
    type: "" as "item" | "service" | "",
    categoryId: "",
    description: "",
    price: "",
    priceUnit: "" as "hour" | "day" | "week" | "event" | "session" | "",
    location: "",
  });

  const categoriesApi = useFirestoreCRUD<Category>({
    collectionName: "categories",
  });
  const listingsApi = useFirestoreCRUD<Listing>({
    collectionName: "listings",
  });
  const walletApi = useFirestoreCRUD<TokenWallet>({ collectionName: "wallets" });
  const transactionsApi = useFirestoreCRUD<TokenTransaction>({ collectionName: "tokenTransactions" });

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll([orderBy("order", "asc")]);
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) {
        setWalletLoading(false);
        return;
      }
      try {
        const wallet = await walletApi.getById(user.uid);
        setTokenBalance(wallet?.balance || 0);
      } catch (error) {
        console.error("Error fetching wallet:", error);
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to create a listing");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const image of images) {
      const fileName = `listings/${user!.uid}/${Date.now()}-${image.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to create a listing");
      return;
    }

    if (!formData.title || !formData.type || !formData.categoryId || !formData.price || !formData.priceUnit) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check token balance
    if (tokenBalance < selectedDuration.tokens) {
      toast.error(`You need ${selectedDuration.tokens} token(s) to create a ${selectedDuration.label} listing`);
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      const imageUrls = images.length > 0 ? await uploadImages() : [];

      // Find selected category
      const selectedCategory = categories.find(
        (c) => c.id === formData.categoryId
      );

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + selectedDuration.days);

      // Deduct tokens from wallet
      const wallet = await walletApi.getById(user.uid);
      if (!wallet || wallet.balance < selectedDuration.tokens) {
        toast.error("Insufficient tokens");
        setLoading(false);
        return;
      }

      await walletApi.update(user.uid, {
        balance: wallet.balance - selectedDuration.tokens,
      });

      // Record transaction
      await transactionsApi.create({
        userId: user.uid,
        type: "debit",
        amount: selectedDuration.tokens,
        description: `Listing Fee - ${formData.title} (${selectedDuration.label})`,
      });

      // Create listing document
      const listingData: Omit<Listing, "id"> = {
        title: formData.title,
        description: formData.description,
        type: formData.type as "item" | "service",
        category: selectedCategory?.name || "",
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        priceUnit: formData.priceUnit,
        location: formData.location,
        images: imageUrls,
        ownerId: user.uid,
        ownerName: user.displayName || "Anonymous",
        ownerAvatar: user.photoURL || undefined,
        status: "active",
        rating: 0,
        reviews: 0,
      };

      await listingsApi.create(listingData);

      toast.success("Listing created successfully!");
      navigate("/browse");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const hasEnoughTokens = tokenBalance >= selectedDuration.tokens;

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create a Listing
          </h1>
          <p className="text-muted-foreground mb-8">
            List your item or service for rent
          </p>

          {/* Token Balance Card */}
          <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${
            hasEnoughTokens ? "bg-secondary/10 border border-secondary/30" : "bg-destructive/10 border border-destructive/30"
          }`}>
            <div className="flex items-center gap-3">
              {hasEnoughTokens ? (
                <Coins className="w-6 h-6 text-secondary" />
              ) : (
                <AlertCircle className="w-6 h-6 text-destructive" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {walletLoading ? "Loading..." : `${tokenBalance} Tokens Available`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedDuration.tokens} token(s) required for {selectedDuration.label} listing
                </p>
              </div>
            </div>
            {!hasEnoughTokens && (
              <Button variant="teal" size="sm" asChild>
                <Link to="/buy-tokens">Buy Tokens</Link>
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Professional DJ Equipment Set"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as "item" | "service",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categoriesLoading ? "Loading..." : "Select category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id || ""}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your item or service in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (R) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="500"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price Unit *</Label>
                <Select
                  value={formData.priceUnit}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priceUnit: value as "hour" | "day" | "week" | "event" | "session",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Per..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                    <SelectItem value="week">Per Week</SelectItem>
                    <SelectItem value="event">Per Event</SelectItem>
                    <SelectItem value="session">Per Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Johannesburg, Sandton"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            {/* Listing Duration */}
            <div className="space-y-2">
              <Label>Listing Duration *</Label>
              <div className="grid grid-cols-3 gap-3">
                {LISTING_DURATION_OPTIONS.map((option) => (
                  <div
                    key={option.days}
                    onClick={() => setSelectedDuration(option)}
                    className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${
                      selectedDuration.days === option.days
                        ? "border-secondary bg-secondary/10 ring-2 ring-secondary"
                        : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-secondary font-medium">{option.tokens} Token{option.tokens > 1 ? "s" : ""}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images (Max 5)</Label>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-destructive-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              {images.length < 5 && (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-secondary transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-foreground">
                        Upload images
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to browse
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Create Listing
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateListing;
