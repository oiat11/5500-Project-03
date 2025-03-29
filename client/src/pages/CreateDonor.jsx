import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/components/ui/toast";
import { PlusCircle, User, Home, DollarSign, Mail, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CreateDonor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    nick_name: "",
    organization_name: "",
    street_address: "",
    unit_number: "",
    city: "",
    total_donation_amount: "",
    total_pledge: "",
    largest_gift_amount: "",
    largest_gift_appeal: "",
    last_gift_amount: "",
    last_gift_request: "",
    last_gift_appeal: "",
    first_gift_date: "",
    last_gift_date: "",
    pmm: "",
    exclude: false,
    deceased: false,
    contact_phone_type: "",
    phone_restrictions: "",
    email_restrictions: "",
    communication_restrictions: "",
    subscription_events_in_person: "",
    subscription_events_magazine: "",
    communication_preference: "",
    tags: [],
  });
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [newTagDialog, setNewTagDialog] = useState(false);
  const [newTag, setNewTag] = useState({ name: "", color: "#6366f1" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const res = await fetch("/api/tag", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch tags");

        const data = await res.json();
        setTags(data.tags.map((tag) => ({
          value: tag.id,
          label: tag.name,
          color: tag.color,
        })));
      } catch (err) {
        console.error("Error fetching tags:", err);
        toast({
          title: "Error",
          description: "Failed to load tags. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, [toast]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleTagsChange = (selectedTags) => {
    setFormData((prev) => ({
      ...prev,
      tags: selectedTags,
    }));
  };

  const handleCreateNewTag = async () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag.name, color: newTag.color }),
      });

      if (!res.ok) throw new Error("Failed to create tag");

      const data = await res.json();
      const createdTag = {
        value: data.tag.id,
        label: data.tag.name,
        color: data.tag.color,
      };

      setTags((prev) => [...prev, createdTag]);
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, createdTag],
      }));
      setNewTag({ name: "", color: "#6366f1" });
      setNewTagDialog(false);

      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    } catch (err) {
      console.error("Error creating tag:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.first_name || !formData.last_name || !formData.street_address || !formData.city || !formData.pmm) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const tagIds = formData.tags.map((tag) => tag.value);
      const processedData = {
        ...formData,
        total_donation_amount: formData.total_donation_amount ? parseFloat(formData.total_donation_amount) : 0,
        total_pledge: formData.total_pledge ? parseFloat(formData.total_pledge) : null,
        largest_gift_amount: formData.largest_gift_amount ? parseFloat(formData.largest_gift_amount) : null,
        last_gift_amount: formData.last_gift_amount ? parseFloat(formData.last_gift_amount) : null,
        first_gift_date: formData.first_gift_date ? new Date(formData.first_gift_date).toISOString() : null,
        last_gift_date: formData.last_gift_date ? new Date(formData.last_gift_date).toISOString() : null,
        tagIds,
      };

      console.log('Sending data to server:', processedData);

      const response = await axios.post("/api/donor", processedData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Donor created successfully!"
        });
        navigate("/donors");
      }
    } catch (err) {
      console.error("Error creating donor:", err);
      const serverMessage = err?.response?.data?.message;
      const fallback = "Failed to create donor. Please try again.";
      const safeMessage = typeof serverMessage === "string" && serverMessage.length < 200 ? serverMessage : fallback;

      toast({
        title: "Error",
        description: safeMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Donor</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/donors")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="donor-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Donor"}
          </Button>
        </div>
      </div>

      <form id="donor-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Enter the donor's personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="first_name" className="mb-1">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="mb-1">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nick_name" className="mb-1">
                  Nickname
                </Label>
                <Input
                  id="nick_name"
                  value={formData.nick_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="organization_name" className="mb-1">
                  Organization Name
                </Label>
                <Input
                  id="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="pmm" className="mb-1">
                  PMM <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pmm"
                  value={formData.pmm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Address Information
            </CardTitle>
            <CardDescription>Enter the donor's address details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="street_address" className="mb-1">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit_number" className="mb-1">
                  Unit Number
                </Label>
                <Input
                  id="unit_number"
                  value={formData.unit_number}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="city" className="mb-1">
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="city"
                  value={formData.city}
                  onValueChange={(value) => handleSelectChange("city", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Victoria">Victoria</SelectItem>
                    <SelectItem value="Nanaimo">Nanaimo</SelectItem>
                    <SelectItem value="Courtenay">Courtenay</SelectItem>
                    <SelectItem value="Parksville">Parksville</SelectItem>
                    <SelectItem value="Campbell_River">Campbell River</SelectItem>
                    <SelectItem value="Saanich">Saanich</SelectItem>
                    <SelectItem value="Vancouver">Vancouver</SelectItem>
                    <SelectItem value="Surrey">Surrey</SelectItem>
                    <SelectItem value="Burnaby">Burnaby</SelectItem>
                    <SelectItem value="Richmond">Richmond</SelectItem>
                    <SelectItem value="North_Vancouver">North Vancouver</SelectItem>
                    <SelectItem value="White_Rock">White Rock</SelectItem>
                    <SelectItem value="Coquitlam">Coquitlam</SelectItem>
                    <SelectItem value="West_Vancouver">West Vancouver</SelectItem>
                    <SelectItem value="New_Westminster">New Westminster</SelectItem>
                    <SelectItem value="Prince_George">Prince George</SelectItem>
                    <SelectItem value="Williams_Lake">Williams Lake</SelectItem>
                    <SelectItem value="Delta">Delta</SelectItem>
                    <SelectItem value="Abbotsford">Abbotsford</SelectItem>
                    <SelectItem value="Maple_Ridge">Maple Ridge</SelectItem>
                    <SelectItem value="Kelowna">Kelowna</SelectItem>
                    <SelectItem value="Langley">Langley</SelectItem>
                    <SelectItem value="Port_Coquitlam">Port Coquitlam</SelectItem>
                    <SelectItem value="Vernon">Vernon</SelectItem>
                    <SelectItem value="Kamloops">Kamloops</SelectItem>
                    <SelectItem value="Salmon_Arm">Salmon Arm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Donation Information
            </CardTitle>
            <CardDescription>Enter the donor's donation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="total_donation_amount" className="mb-1">
                  Total Donation Amount
                </Label>
                <Input
                  id="total_donation_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_donation_amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="total_pledge" className="mb-1">
                  Total Pledge
                </Label>
                <Input
                  id="total_pledge"
                  type="number"
                  step="0.01"
                  value={formData.total_pledge}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="largest_gift_amount" className="mb-1">
                  Largest Gift Amount
                </Label>
                <Input
                  id="largest_gift_amount"
                  type="number"
                  step="0.01"
                  value={formData.largest_gift_amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="largest_gift_appeal" className="mb-1">
                  Largest Gift Appeal
                </Label>
                <Input
                  id="largest_gift_appeal"
                  value={formData.largest_gift_appeal}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="last_gift_amount" className="mb-1">
                  Last Gift Amount
                </Label>
                <Input
                  id="last_gift_amount"
                  type="number"
                  step="0.01"
                  value={formData.last_gift_amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="last_gift_request" className="mb-1">
                  Last Gift Request
                </Label>
                <Input
                  id="last_gift_request"
                  value={formData.last_gift_request}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="last_gift_appeal" className="mb-1">
                  Last Gift Appeal
                </Label>
                <Input
                  id="last_gift_appeal"
                  value={formData.last_gift_appeal}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="first_gift_date" className="mb-1">
                  First Gift Date
                </Label>
                <Input
                  id="first_gift_date"
                  type="date"
                  value={formData.first_gift_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="last_gift_date" className="mb-1">
                  Last Gift Date
                </Label>
                <Input
                  id="last_gift_date"
                  type="date"
                  value={formData.last_gift_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
            <CardDescription>
              Set the donor's communication preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="contact_phone_type" className="mb-1">
                  Contact Phone Type
                </Label>
                <Select
                  id="contact_phone_type"
                  value={formData.contact_phone_type}
                  onValueChange={(value) =>
                    handleSelectChange("contact_phone_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone_restrictions" className="mb-1">
                  Phone Restrictions
                </Label>
                <Input
                  id="phone_restrictions"
                  value={formData.phone_restrictions}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="email_restrictions" className="mb-1">
                  Email Restrictions
                </Label>
                <Input
                  id="email_restrictions"
                  value={formData.email_restrictions}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="communication_restrictions" className="mb-1">
                  Communication Restrictions
                </Label>
                <Input
                  id="communication_restrictions"
                  value={formData.communication_restrictions}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="subscription_events_in_person" className="mb-1">
                  In-Person Events
                </Label>
                <Select
                  id="subscription_events_in_person"
                  value={formData.subscription_events_in_person}
                  onValueChange={(value) =>
                    handleSelectChange("subscription_events_in_person", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Opt_in">Opt in</SelectItem>
                    <SelectItem value="Opt_out">Opt out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subscription_events_magazine" className="mb-1">
                  Magazine
                </Label>
                <Select
                  id="subscription_events_magazine"
                  value={formData.subscription_events_magazine}
                  onValueChange={(value) =>
                    handleSelectChange("subscription_events_magazine", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Opt_in">Opt in</SelectItem>
                    <SelectItem value="Opt_out">Opt out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="communication_preference" className="mb-1">
                  Communication Type
                </Label>
                <Select
                  id="communication_preference"
                  value={formData.communication_preference}
                  onValueChange={(value) =>
                    handleSelectChange("communication_preference", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thank_you">Thank you</SelectItem>
                    <SelectItem value="Magazine">Magazine</SelectItem>
                    <SelectItem value="Inspiration_event">
                      Inspiration event
                    </SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                    <SelectItem value="Survey">Survey</SelectItem>
                    <SelectItem value="Holiday_Card">Holiday Card</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Appeal">Appeal</SelectItem>
                    <SelectItem value="Research_update">
                      Research update
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exclude"
                    checked={formData.exclude}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, exclude: checked }))
                    }
                  />
                  <Label htmlFor="exclude">
                    This donor should be excluded from all communications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deceased"
                    checked={formData.deceased}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, deceased: checked }))
                    }
                  />
                  <Label htmlFor="deceased">This donor is deceased</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
            <CardDescription>Categorize this donor with tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Label>Select Tags</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTagDialog(true)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Tag
                </Button>
              </div>
              <MultiSelect
                options={tags}
                value={formData.tags}
                onChange={handleTagsChange}
                placeholder="Select tags..."
                isLoading={loadingTags}
              />
            </div>
          </CardContent>
        </Card>
      </form>

      <Dialog open={newTagDialog} onOpenChange={setNewTagDialog}>
        <DialogContent className="sm:max-w-[500px] w-[90vw]">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-tag-name">Tag Name</Label>
              <Input
                id="new-tag-name"
                value={newTag.name}
                onChange={(e) =>
                  setNewTag((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter tag name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-tag-color">Tag Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-tag-color"
                  type="color"
                  value={newTag.color}
                  onChange={(e) =>
                    setNewTag((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-16 h-10 p-1"
                />
                <div
                  className="w-full h-10 rounded-md border"
                  style={{ backgroundColor: newTag.color }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewTag}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
