import { useState } from "react";
import { useCMS } from "@/contexts/CMSContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SiteContentManagement() {
  const { siteContent, updateSiteContent, getSiteContent } = useCMS();
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newContent, setNewContent] = useState({ key: "", value: "" });

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSave = (key: string) => {
    updateSiteContent(key, editValue);
    setEditingKey(null);
    toast({ title: "Saved", description: "Content updated successfully" });
  };

  const handleAddNew = () => {
    if (!newContent.key.trim()) {
      toast({ title: "Error", description: "Content key is required", variant: "destructive" });
      return;
    }
    updateSiteContent(newContent.key, newContent.value);
    setNewContent({ key: "", value: "" });
    toast({ title: "Added", description: "New content added successfully" });
  };

  const groupedContent = siteContent.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof siteContent>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Content</h1>
        <p className="text-muted-foreground mt-1">
          Manage text and content displayed across the website
        </p>
      </div>

      {/* Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="newKey">Content Key</Label>
              <Input
                id="newKey"
                value={newContent.key}
                onChange={(e) => setNewContent(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                placeholder="e.g., footer_text"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="newValue">Value</Label>
              <div className="flex gap-2">
                <Input
                  id="newValue"
                  value={newContent.value}
                  onChange={(e) => setNewContent(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Content value"
                />
                <Button onClick={handleAddNew}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content by Section */}
      {Object.entries(groupedContent).map(([section, items]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <FileText className="h-5 w-5 text-secondary" />
              {section} Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {item.key}
                    </TableCell>
                    <TableCell>
                      {editingKey === item.key ? (
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={3}
                          className="min-w-[300px]"
                        />
                      ) : (
                        <p className="text-sm line-clamp-2">{item.value}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingKey === item.key ? (
                        <Button
                          size="sm"
                          onClick={() => handleSave(item.key)}
                          className="gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item.key, item.value)}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Usage Guide */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Content keys are used to dynamically load text throughout the site. 
            Use the <code className="bg-muted px-1 rounded">getSiteContent("key_name")</code> function 
            in your components to retrieve values.
          </p>
          <p>
            <strong>Examples:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><code>hero_title</code> → Main headline on the homepage</li>
            <li><code>hero_subtitle</code> → Subheadline below the main title</li>
            <li><code>site_name</code> → Site name used in header/footer</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
