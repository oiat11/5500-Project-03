import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditEventDetailsModal({
  open,
  onClose,
  eventData,
  onSave,
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventData) {
      setFormData({
        name: eventData.name || "",
        date: eventData.date ? eventData.date.slice(0, 10) : "",
        location: eventData.location || "",
        description: eventData.description || "",
        status: eventData.status || "draft",
      });
    }
  }, [eventData]);

  const handleSave = async () => {
    try {
      setSaving(true); // 开始保存
      const fixedDate = new Date(`${formData.date}T12:00:00`);

      const res = await fetch(`/api/event/${eventData.id}/info`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          date: fixedDate.toISOString(),
          location: formData.location,
          status: formData.status,
          tagIds: formData.tags?.map((tag) => tag.value) || [],
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast({
        title: "Success",
        description: "Event details updated successfully",
      });

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update event details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl" hideCloseButton>
        <Card>
          <CardHeader>
            <CardTitle>Edit Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground italic">
              Fields marked with <span className="text-red-500">*</span> are
              required.
            </p>

            <div className="space-y-2">
              <Label htmlFor="name" className="mb-1 block">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="mb-1 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="mb-1 block">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="mb-1 block">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="mb-1 block">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
