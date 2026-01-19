import { useCMS } from "@/contexts/CMSContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function ListingPricingManagement() {
  const { listingPricing, categories, updateListingPricing } = useCMS();
  const { toast } = useToast();

  const handleUpdate = (id: string, field: string, value: number | boolean) => {
    updateListingPricing(id, { [field]: value });
    toast({ title: "Updated", description: "Pricing updated successfully" });
  };

  const getCategoryName = (categoryId: string) => {
    if (categoryId === "default") return "Default (All Categories)";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Listing Pricing</h1>
        <p className="text-muted-foreground mt-1">
          Configure token costs for listing creation and renewal per category
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-secondary/5 border-secondary/20">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Tokens Required</p>
              <p className="text-xs text-muted-foreground">
                Number of tokens deducted when creating a listing
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Duration (Days)</p>
              <p className="text-xs text-muted-foreground">
                How long a listing stays active before expiring
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Renewal Tokens</p>
              <p className="text-xs text-muted-foreground">
                Number of tokens to renew an expired listing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Pricing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Tokens Required</TableHead>
                <TableHead>Duration (Days)</TableHead>
                <TableHead>Renewal Tokens</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listingPricing.map((pricing) => (
                <TableRow key={pricing.id}>
                  <TableCell className="font-medium">
                    {getCategoryName(pricing.categoryId)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={pricing.tokensRequired}
                      onChange={(e) => handleUpdate(pricing.id, "tokensRequired", parseInt(e.target.value) || 0)}
                      className="w-20"
                      min={0}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={pricing.durationDays}
                      onChange={(e) => handleUpdate(pricing.id, "durationDays", parseInt(e.target.value) || 30)}
                      className="w-20"
                      min={1}
                      max={90}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={pricing.renewalTokens}
                      onChange={(e) => handleUpdate(pricing.id, "renewalTokens", parseInt(e.target.value) || 0)}
                      className="w-20"
                      min={0}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={pricing.isActive}
                      onCheckedChange={(checked) => handleUpdate(pricing.id, "isActive", checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add New Category Pricing Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> The "Default" pricing applies to all categories that don't have specific pricing rules. 
            To add category-specific pricing, ensure the category exists in the Categories section first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
