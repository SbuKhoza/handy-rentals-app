import { useState } from "react";
import { useCMS } from "@/contexts/CMSContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@/types/cms";

export default function ListingsManagement() {
  const { listings, categories, addListing, updateListing, deleteListing } = useCMS();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [filter, setFilter] = useState({ search: "", category: "all", status: "all" });
  const [formData, setFormData] = useState({
    title: "",
    type: "item" as "item" | "service",
    category: "",
    price: 0,
    priceUnit: "day",
    location: "",
    description: "",
    image: "",
    rating: 0,
    reviews: 0,
    owner: { name: "", avatar: "" },
    isActive: true,
    isFeatured: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      type: "item",
      category: "",
      price: 0,
      priceUnit: "day",
      location: "",
      description: "",
      image: "",
      rating: 0,
      reviews: 0,
      owner: { name: "", avatar: "" },
      isActive: true,
      isFeatured: false,
    });
    setEditingListing(null);
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title,
      type: listing.type,
      category: listing.category,
      price: listing.price,
      priceUnit: listing.priceUnit,
      location: listing.location,
      description: listing.description || "",
      image: listing.image,
      rating: listing.rating,
      reviews: listing.reviews,
      owner: listing.owner,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.category) {
      toast({ title: "Error", description: "Title and category are required", variant: "destructive" });
      return;
    }

    if (editingListing) {
      updateListing(editingListing.id, formData);
      toast({ title: "Success", description: "Listing updated successfully" });
    } else {
      addListing(formData);
      toast({ title: "Success", description: "Listing added successfully" });
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteListing(id);
      toast({ title: "Deleted", description: `Listing "${title}" has been deleted` });
    }
  };

  const toggleFeatured = (id: string, currentStatus: boolean) => {
    updateListing(id, { isFeatured: !currentStatus });
    toast({ 
      title: currentStatus ? "Removed from featured" : "Added to featured",
      description: currentStatus ? "Listing is no longer featured" : "Listing is now featured"
    });
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateListing(id, { isActive: !currentStatus });
    toast({ 
      title: currentStatus ? "Deactivated" : "Activated",
      description: currentStatus ? "Listing is now inactive" : "Listing is now active"
    });
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(filter.search.toLowerCase());
    const matchesCategory = filter.category === "all" || listing.category === filter.category;
    const matchesStatus = filter.status === "all" || 
      (filter.status === "active" && listing.isActive) ||
      (filter.status === "inactive" && !listing.isActive) ||
      (filter.status === "featured" && listing.isFeatured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCategories = categories.filter(c => c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
          <p className="text-muted-foreground mt-1">Manage marketplace listings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingListing ? "Edit Listing" : "Add New Listing"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Listing title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "item" | "service") => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item">Item</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Area"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (R)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price Unit</Label>
                  <Select
                    value={formData.priceUnit}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priceUnit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Per Hour</SelectItem>
                      <SelectItem value="day">Per Day</SelectItem>
                      <SelectItem value="week">Per Week</SelectItem>
                      <SelectItem value="month">Per Month</SelectItem>
                      <SelectItem value="event">Per Event</SelectItem>
                      <SelectItem value="session">Per Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the listing..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.owner.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      owner: { ...prev.owner, name: e.target.value } 
                    }))}
                    placeholder="Owner name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerAvatar">Owner Avatar URL</Label>
                  <Input
                    id="ownerAvatar"
                    value={formData.owner.avatar}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      owner: { ...prev.owner, avatar: e.target.value } 
                    }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingListing ? "Update" : "Add"} Listing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search listings..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-xs"
            />
            <Select
              value={filter.category}
              onValueChange={(value) => setFilter(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {activeCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.status}
              onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Listings ({filteredListings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-12 w-16 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.type}</p>
                    </div>
                  </TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>R{listing.price}/{listing.priceUnit}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs w-fit ${
                        listing.isActive 
                          ? "bg-success/10 text-success" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {listing.isActive ? "Active" : "Inactive"}
                      </span>
                      {listing.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 w-fit">
                          Featured
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(listing.id, listing.isFeatured)}
                      title={listing.isFeatured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className={`h-4 w-4 ${listing.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(listing.id, listing.isActive)}
                      title={listing.isActive ? "Deactivate" : "Activate"}
                    >
                      {listing.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(listing)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(listing.id, listing.title)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
