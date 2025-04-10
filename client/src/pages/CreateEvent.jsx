import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

import DonorFilters from "@/components/DonorFilters";
import CurrentDonorsList from "@/components/CurrentDonorsList";
import DonorSelection from "@/components/DonorSelection";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add step state to track the current step
  const [currentStep, setCurrentStep] = useState(1);
  const [targetDonorCount, setTargetDonorCount] = useState(null);

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

  // First, let's add a state to track whether to show donors
  const [showDonors, setShowDonors] = useState(false);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);

      // Replace the donor API call with the recommend API
      const response = await axios.get("/api/donor/recommend", {
        params: {
          count: targetDonorCount || 20, // Use targetDonorCount or default to 20
          search: searchTerm,
          ...activeFilters,
          // Pass any already selected donor IDs to exclude them
          excludeIds: formData.donors.map(d => d.id || d.value).join(',')
        },
      });

      // Update to use the recommended property from the response
      setFilteredDonors(response.data.recommended || []);
      setAvailableFilters(response.data.filters || {});
    } catch (error) {
      console.error("Error fetching recommended donors:", error);
      setError("Failed to fetch donors");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilters, targetDonorCount, formData.donors]);

  useEffect(() => {
    if (currentStep === 2) {
      fetchDonors();
    }
  }, [fetchDonors, currentStep]);

  const handleFilterChange = useCallback((newFilters) => {
    console.log("Filters changed to:", newFilters);
    setActiveFilters(newFilters);
  }, []);

  const removeDonor = (donorId) => {
    // If donorId is actually a donor object, extract the ID
    const id = typeof donorId === 'object' ? (donorId.id || donorId.value) : donorId;
    
    setFormData((prev) => {
      const newDonors = prev.donors.filter((d) => (d.id || d.value) !== id);
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
      donor_count: isSelected ? prev.donors.length - 1 : prev.donors.length + 1,
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

  // Function to move to the next step
  const goToNextStep = () => {
    // Validate first step
    if (currentStep === 1) {
      if (!formData.name || !formData.date || !formData.location) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    setCurrentStep(2);
  };

  // Function to go back to the previous step
  const goToPreviousStep = () => {
    setCurrentStep(1);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Format the donor data correctly for the API
      const eventData = {
        ...formData,
        donors: formData.donors.map((donor) => ({
          donorId: donor.id,
          status: donor.status || "invited",
        })),
      };

      console.log("Submitting event data:", eventData);

      const res = await axios.post("/api/event", eventData);
      if (res.status === 200 || res.status === 201) {
        toast({ title: "Success", description: "Event created successfully!" });
        navigate("/events");
      }
    } catch (err) {
      console.error("Error creating event:", err);

      // Check for unique constraint error on event name
      if (
        err.response?.data?.message?.includes(
          "Unique constraint failed on the constraint: `Event_name_key`"
        )
      ) {
        const errorMessage =
          "An event with this name already exists. Please choose a different name.";
        setError(errorMessage);
        toast({
          title: "Duplicate Event Name",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Handle other errors
        const errorMessage =
          err.response?.data?.message || "Failed to create event";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const recommendDonors = async () => {
    if (!targetDonorCount || targetDonorCount <= 0) {
      toast({
        title: "Invalid number",
        description: "Please enter a valid number of donors to recommend",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call the recommend API directly
      const response = await axios.get("/api/donor/recommend", {
        params: {
          count: targetDonorCount,
          ...activeFilters,
          // Exclude already selected donors
          excludeIds: formData.donors.map(d => d.id || d.value).join(',')
        },
      });
      
      // Update the filtered donors with the recommended donors
      setFilteredDonors(response.data.recommended || []);
      setShowDonors(true);

      toast({
        title: "Donors recommended",
        description: `Showing top ${response.data.recommended.length} donors based on donation amount`,
      });
    } catch (error) {
      console.error("Error recommending donors:", error);
      toast({
        title: "Error",
        description: "Failed to recommend donors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // First, add the addAllDonors function
  const addAllDonors = () => {
    if (!showDonors || filteredDonors.length === 0) {
      toast({
        title: "No donors to add",
        description: "Please recommend donors first",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      donors: filteredDonors.map((donor) => ({ ...donor, status: "invited" })),
      donor_count: filteredDonors.length,
    }));

    toast({
      title: "All donors added",
      description: `Added ${filteredDonors.length} donors to your event`,
    });
  };

  // Then add the clearAllDonors function
  const clearAllDonors = () => {
    setFormData((prev) => ({
      ...prev,
      donors: [],
      donor_count: 0,
    }));

    toast({
      title: "Donors cleared",
      description: "All donors have been removed from your event",
    });
  };

  // Step 1: Event Details Form
  const renderStepOne = () => (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Step 1 of 2: Enter basic event information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <Label htmlFor="date">Date *</Label>
          <Input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            required
          />

          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) => setFormData({ ...formData, status: val })}
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

          <Button type="button" className="w-full" onClick={goToNextStep}>
            Continue to Donor Selection
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Step 2: Donor Selection
  const renderStepTwo = () => (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="mb-1">Donor Selection</CardTitle>
            <CardDescription>
              Step 2 of 2: Select donors for your event
            </CardDescription>
          </div>
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              Back to Event Details
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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
            <DonorFilters
              onFilterChange={handleFilterChange}
              availableFilters={availableFilters}
            />

            <div className="flex items-end gap-2 my-4">
              <div className="flex-1">
                <Label
                  htmlFor="donorCount"
                  className="mb-2 block whitespace-nowrap"
                >
                  Target Number of Donors to Include
                </Label>
                <Input
                  id="donorCount"
                  type="number"
                  min="0"
                  value={targetDonorCount === null ? "" : targetDonorCount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setTargetDonorCount(null);
                    } else {
                      setTargetDonorCount(parseInt(value) || 0);
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={recommendDonors}
                  disabled={!targetDonorCount || targetDonorCount <= 0}
                >
                  Recommend Donors
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAllDonors}
                  disabled={!showDonors || filteredDonors.length === 0}
                >
                  Add All
                </Button>
              </div>
            </div>

            {showDonors && (
              <div className="mt-4">
                <DonorSelection
                  donors={filteredDonors}
                  selectedDonors={formData.donors}
                  onToggle={toggleDonor}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="mb-1">
                Selected Donors ({formData.donors.length}
                {targetDonorCount !== null && targetDonorCount > 0
                  ? `/${targetDonorCount}`
                  : ""}
                )
              </CardTitle>
              <CardDescription>These donors will be invited</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAllDonors}
              disabled={formData.donors.length === 0}
            >
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <CurrentDonorsList
              donors={formData.donors}
              onRemove={removeDonor}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className="w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {currentStep === 1 ? renderStepOne() : renderStepTwo()}
      </form>
    </div>
  );
}
