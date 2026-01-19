import { useState } from "react";
import { useCMS } from "@/contexts/CMSContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Coins, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TokenPackage } from "@/types/cms";

export default function TokenPackagesManagement() {
  const { tokenPackages, addTokenPackage, updateTokenPackage, deleteTokenPackage } = useCMS();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tokens: 10,
    price: 50,
    currency: "ZAR",
    isPopular: false,
    isActive: true,
    order: 1,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      tokens: 10,
      price: 50,
      currency: "ZAR",
      isPopular: false,
      isActive: true,
      order: tokenPackages.length + 1,
    });
    setEditingPackage(null);
  };

  const handleEdit = (pkg: TokenPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      tokens: pkg.tokens,
      price: pkg.price,
      currency: pkg.currency,
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      order: pkg.order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Package name is required", variant: "destructive" });
      return;
    }

    if (editingPackage) {
      updateTokenPackage(editingPackage.id, formData);
      toast({ title: "Success", description: "Token package updated successfully" });
    } else {
      addTokenPackage(formData);
      toast({ title: "Success", description: "Token package added successfully" });
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteTokenPackage(id);
      toast({ title: "Deleted", description: `Package "${name}" has been deleted` });
    }
  };

  const sortedPackages = [...tokenPackages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Token Packages</h1>
          <p className="text-muted-foreground mt-1">Manage token packages for purchase</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "Edit Token Package" : "Add New Token Package"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Starter, Pro, Business"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokens">Token Amount</Label>
                  <Input
                    id="tokens"
                    type="number"
                    value={formData.tokens}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokens: parseInt(e.target.value) || 0 }))}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (R)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  min={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="popular">Mark as Popular</Label>
                <Switch
                  id="popular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingPackage ? "Update" : "Add"} Package
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sortedPackages.filter(p => p.isActive).map((pkg) => (
          <Card key={pkg.id} className={pkg.isPopular ? "ring-2 ring-secondary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                {pkg.isPopular && (
                  <span className="flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-secondary" />
                    Popular
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold">R{pkg.price}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Coins className="h-4 w-4" />
                <span>{pkg.tokens} tokens</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                R{(pkg.price / pkg.tokens).toFixed(2)} per token
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages ({tokenPackages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Per Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pkg.name}</span>
                      {pkg.isPopular && (
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{pkg.tokens}</TableCell>
                  <TableCell>R{pkg.price}</TableCell>
                  <TableCell className="text-muted-foreground">
                    R{(pkg.price / pkg.tokens).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      pkg.isActive 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pkg.id, pkg.name)}
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
