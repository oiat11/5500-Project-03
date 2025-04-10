// CreateEvent.jsx
import React, { useState } from "react";
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

import DonorSelection from "@/components/DonorSelection";
import CurrentDonorsList from "@/components/CurrentDonorsList";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    status: "draft",
    donors: [],
    donor_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToNextStep = () => {
    if (!formData.name || !formData.date || !formData.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const goToPreviousStep = () => setCurrentStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventData = {
        ...formData,
        donors: formData.donors.map((donor) => ({
          donorId: donor.id,
          status: donor.status || "invited",
        })),
      };

      const res = await axios.post("/api/event", eventData);
      if (res.status === 200 || res.status === 201) {
        toast({ title: "Success", description: "Event created successfully!" });
        navigate("/events");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message?.includes("Unique constraint failed on the constraint: `Event_name_key`")
        ? "An event with this name already exists. Please choose a different name."
        : err.response?.data?.message || "Failed to create event";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearAllDonors = () => {
    setFormData((prev) => ({ ...prev, donors: [], donor_count: 0 }));
    toast({ title: "Donors cleared", description: "All donors have been removed from your event" });
  };

  const removeDonor = (donorId) => {
    const id = typeof donorId === 'object' ? (donorId.id || donorId.value) : donorId;
    setFormData((prev) => {
      const updated = prev.donors.filter((d) => (d.id || d.value) !== id);
      return { ...prev, donors: updated, donor_count: updated.length };
    });
  };

  const renderStepOne = () => (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Step 1 of 2: Enter basic event information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

          <Label htmlFor="date">Date *</Label>
          <Input type="date" id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />

          <Label htmlFor="location">Location *</Label>
          <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />

          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button type="button" className="w-full" onClick={goToNextStep}>Continue to Donor Selection</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepTwo = () => (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="mb-1">Donor Selection</CardTitle>
            <CardDescription>Step 2 of 2: Select donors for your event</CardDescription>
          </div>
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={goToPreviousStep}>Back to Event Details</Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </CardHeader>
        {error && <CardContent><p className="text-red-500 text-sm mt-2">{error}</p></CardContent>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonorSelection
          selectedDonors={formData.donors}
          onChange={(updatedDonors) => setFormData((prev) => ({ ...prev, donors: updatedDonors, donor_count: updatedDonors.length }))}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="mb-1">Selected Donors ({formData.donors.length})</CardTitle>
              <CardDescription>These donors will be invited</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={clearAllDonors} disabled={formData.donors.length === 0}>Clear All</Button>
          </CardHeader>
          <CardContent>
            <CurrentDonorsList donors={formData.donors} onRemove={removeDonor} />
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
