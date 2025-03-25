import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(false);

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
          label: tag.name
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

  useEffect(() => {
    const fetchDonors = async () => {
      setLoadingDonors(true);
      try {
        const res = await fetch("/api/donor/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) throw new Error("Failed to fetch donors");
        
        const data = await res.json();
        setDonors(data.donors.map(donor => ({
          value: donor.id,
          label: donor.first_name + " " + donor.last_name
        })));
      } catch (err) {
        console.error("Error fetching donors:", err);
        setError("Failed to load donors. Please try again.");
      } finally {
        setLoadingDonors(false);
      }
    };
    
    fetchDonors();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
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

  const handleDonorsChange = (selectedDonors) => {
    setFormData((prev) => ({
      ...prev,
      donors: selectedDonors,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          tagIds: formData.tags.map(tag => tag.value),
          donorIds: formData.donors.map(donor => donor.value)
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create event");

      toast({
        title: "Event Created",
        description: "Your event has been successfully created.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/events");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-[800px] px-4">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={handleChange} required />
              </div>
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
            <div className="grid gap-2">
              <Label htmlFor="donors">Donors</Label>
              <MultiSelect
                id="donors"
                isLoading={loadingDonors}
                options={donors}
                value={formData.donors}
                onChange={handleDonorsChange}
                placeholder="Select donors..."
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
