import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

import DonorFilters from "@/components/DonorFilters";
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
    status: "draft",
    donors: [],
    donor_count: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({});
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("total_donation_amount");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axios.get("/api/donor", {
        params: {
          page: 1,
          limit: 100,
          search: searchTerm,
          sortBy: sortBy,
          sortOrder: sortOrder,
          ...activeFilters,
        },
      });
      
      console.log("API response received, applying client-side filters");
      
      // Apply client-side filtering
      let filteredResults = response.data.donors;
      
      
      // Add more filters as needed
      if (activeFilters.tag) {
        console.log("Applying tag filter:", activeFilters.tag);
        filteredResults = filteredResults.filter(donor => 
          donor.tags && donor.tags.some(tag => 
            tag.id === activeFilters.tag || tag.name === activeFilters.tag
          )
        );
      }
      
      setFilteredDonors(filteredResults);
      setAvailableFilters(response.data.filters || {});
    } catch (error) {
      console.error("Error fetching donors:", error);
      setError("Failed to fetch donors");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilters, sortBy, sortOrder]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const handleFilterChange = useCallback((newFilters) => {
    console.log("Filters changed to:", newFilters);
    setActiveFilters(newFilters);
  }, []);

  const removeDonor = (donorId) => {
    setFormData((prev) => {
      const newDonors = prev.donors.filter((d) => d.id !== donorId);
      return {
        ...prev,
        donors: newDonors,
        donor_count: newDonors.length,
      };
    });
  };

  const toggleDonor = (donor) => {
    const isSelected = formData.donors.some((d) => d.id === donor.id);
    setFormData((prev) => ({
      ...prev,
      donors: isSelected
        ? prev.donors.filter((d) => d.id !== donor.id)
        : [...prev.donors, { ...donor, status: "invited" }],
      donor_count: isSelected
        ? prev.donors.length - 1
        : prev.donors.length + 1,
    }));
  };

  const handleDonorStatusChange = (donorId, status) => {
    setFormData((prev) => ({
      ...prev,
      donors: prev.donors.map((donor) =>
        (donor.id || donor.value) === donorId ? { ...donor, status } : donor
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventData = {
        ...formData,
        donors: formData.donors.map((donor) => ({ donorId: donor.id, status: donor.status || "invited" })),
      };

      const res = await axios.post("/api/event", eventData);
      if (res.status === 200) {
        toast({ title: "Success", description: "Event created successfully!" });
        navigate("/events");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

            <Label htmlFor="date">Date</Label>
            <Input type="date" id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />

            <Label htmlFor="location">Location</Label>
            <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />

            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Donors ({formData.donors.length})</CardTitle>
            <CardDescription>These donors will be invited</CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentDonorsList donors={formData.donors} onRemove={removeDonor} onStatusChange={handleDonorStatusChange} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Add Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search donors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DonorFilters onFilterChange={handleFilterChange} availableFilters={availableFilters} />
            <div className="mt-4">
              <DonorSelection
                donors={filteredDonors}
                selectedDonors={formData.donors}
                onToggle={toggleDonor}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
