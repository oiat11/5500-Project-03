import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CurrentDonorsList from "@/components/CurrentDonorsList";
import DonorSelection from "@/components/DonorSelection";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    tags: [],
    donors: [],
    status: "draft",
    donor_count: 0
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // 获取所有标签
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const res = await fetch("/api/tag", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) throw new Error("Failed to fetch tags");
        
        const data = await res.json();
        if (!Array.isArray(data.tags)) throw new Error("Invalid tag data format");
        setTags(data.tags.map(tag => ({
          value: tag.id,
          label: tag.name,
          color: tag.color || "#6366f1"
        })));
        
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load tags. Please try again.");
      } finally {
        setLoadingTags(false);
      }
    };
    
    fetchTags();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleTagsChange = (selectedTags) => {
    setFormData(prev => ({ ...prev, tags: selectedTags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.name) {
        throw new Error("Event name is required");
      }

      const eventData = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        status: formData.status,
        donor_count: formData.donors.length,
        tagIds: formData.tags.map(tag => tag.value),
        donors: formData.donors.map(donor => ({
          donorId: donor.value,
          status: "invited"
        }))
      };

      const res = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      navigate("/events");
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDonorStatusChange = (donorId, newStatus) => {
    setFormData(prev => ({
      ...prev,
      donors: prev.donors.map(donor =>
        donor.value === donorId ? { ...donor, status: newStatus } : donor
      )
    }));
  };

  const handleRemoveDonor = (donor) => {
    setFormData(prev => ({
      ...prev,
      donors: prev.donors.filter(d => d.value !== donor.value)
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={formData.date} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location} onChange={handleChange} />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  id="status" 
                  value={formData.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <MultiSelect
                  id="tags"
                  isLoading={loadingTags}
                  options={tags}
                  value={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Select tags..."
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Event"}
                </Button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </CardContent>
          </Card>
          
          {/* Current Donors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Selected Donors ({formData.donors.length})
              </CardTitle>
              <CardDescription>
                Donors to be invited to this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrentDonorsList 
                donors={formData.donors} 
                onStatusChange={handleDonorStatusChange} 
                onRemove={handleRemoveDonor} 
              />
            </CardContent>
          </Card>
          
          {/* Add Donors */}
          <Card>
            <CardHeader>
              <CardTitle>Add Donors</CardTitle>
              <CardDescription>
                Search or get recommendations for donors to add to this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonorSelection formData={formData} setFormData={setFormData} tags={tags} />
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
