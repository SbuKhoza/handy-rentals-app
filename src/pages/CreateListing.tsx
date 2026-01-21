import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Camera } from "lucide-react";

const CreateListing = () => {
  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create a Listing</h1>
          <p className="text-muted-foreground mb-8">List your item or service for rent</p>

          <form className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g., Professional DJ Equipment Set" />
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select>
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
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="camping">Camping</SelectItem>
                    <SelectItem value="music">Music & Audio</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
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
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (R)</Label>
                <Input id="price" type="number" placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label>Price Unit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Per..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                    <SelectItem value="week">Per Week</SelectItem>
                    <SelectItem value="event">Per Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Johannesburg, Sandton" />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-secondary transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">Upload images</p>
                  <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="teal" size="lg" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateListing;
