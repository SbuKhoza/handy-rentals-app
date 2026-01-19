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
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/types/cms";

const iconOptions = [
  "Home", "Briefcase", "Car", "Tent", "Camera", "Wrench", "Music", "Bike",
  "Laptop", "Sofa", "Shirt", "Gamepad", "Dumbbell", "ChefHat", "Package"
];

const colorOptions = [
  { label: "Emerald", value: "bg-emerald-500/10 text-emerald-600" },
  { label: "Sky", value: "bg-sky-500/10 text-sky-600" },
  { label: "Blue", value: "bg-blue-500/10 text-blue-600" },
  { label: "Green", value: "bg-green-500/10 text-green-600" },
  { label: "Purple", value: "bg-purple-500/10 text-purple-600" },
  { label: "Orange", value: "bg-orange-500/10 text-orange-600" },
  { label: "Pink", value: "bg-pink-500/10 text-pink-600" },
  { label: "Cyan", value: "bg-cyan-500/10 text-cyan-600" },
  { label: "Indigo", value: "bg-indigo-500/10 text-indigo-600" },
  { label: "Amber", value: "bg-amber-500/10 text-amber-600" },
  { label: "Rose", value: "bg-rose-500/10 text-rose-600" },
  { label: "Violet", value: "bg-violet-500/10 text-violet-600" },
  { label: "Red", value: "bg-red-500/10 text-red-600" },
  { label: "Teal", value: "bg-teal-500/10 text-teal-600" },
];

export default function CategoriesManagement() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCMS();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "Package",
    color: colorOptions[0].value,
    isActive: true,
    order: 1,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "Package",
      color: colorOptions[0].value,
      isActive: true,
      order: categories.length + 1,
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      order: category.order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      toast({ title: "Success", description: "Category updated successfully" });
    } else {
      addCategory(formData);
      toast({ title: "Success", description: "Category added successfully" });
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCategory(id);
      toast({ title: "Deleted", description: `Category "${name}" has been deleted` });
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage marketplace categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Category name"
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className="text-xs"
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-7 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`h-8 w-8 rounded-full ${color.value.split(' ')[0]} border-2 transition-all ${
                        formData.color === color.value ? 'border-secondary scale-110' : 'border-transparent'
                      }`}
                      title={color.label}
                    />
                  ))}
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
                  {editingCategory ? "Update" : "Add"} Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.icon}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${category.color}`}>
                      Sample
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      category.isActive 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id, category.name)}
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
