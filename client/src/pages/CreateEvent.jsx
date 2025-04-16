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
import ConfirmDialog from "@/components/ui/confirm-dialog";


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
    capacity: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOverCapacityDialog, setShowOverCapacityDialog] = useState(false);
const [pendingSubmit, setPendingSubmit] = useState(false);


  const goToNextStep = () => {
    const { name, date, location, capacity } = formData;
  
    if (!name || !date || !location || !capacity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
  
    const capacityNum = Number(capacity);
    if (!Number.isInteger(capacityNum) || capacityNum <= 0) {
      toast({
        title: "Invalid Capacity",
        description: "Capacity must be a positive whole number (no decimals)",
        variant: "destructive",
      });
      return;
    }
  
    setCurrentStep(2);
  };
  

  const goToPreviousStep = () => setCurrentStep(1);
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const donorCount = formData.donors.length;
    const capacityNum = parseInt(formData.capacity);
  
    if (capacityNum && donorCount > capacityNum) {
      setShowOverCapacityDialog(true);
      setPendingSubmit(true);
      return;
    }
  
    await submitEvent();
  };
  
  const submitEvent = async () => {
    setLoading(true);
    try {
      const localDate = new Date(`${formData.date}T12:00:00`);
  
      const eventData = {
        ...formData,
        date: localDate.toISOString(),
        capacity: parseInt(formData.capacity),
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
      setPendingSubmit(false);
      setShowOverCapacityDialog(false);
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
        <CardContent>
          <p className="text-sm text-muted-foreground italic mb-4">
            Please fill out all fields marked with <span className="text-red-500">*</span>.
          </p>

          <div className="mb-4">
            <Label htmlFor="name" className="mb-1 block">Name <span className="text-red-500">*</span></Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="mb-4">
            <Label htmlFor="description" className="mb-1 block">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="mb-4">
            <Label htmlFor="date" className="mb-1 block">Date <span className="text-red-500">*</span></Label>
            <Input
  type="date"
  id="date"
  min={new Date().toISOString().split("T")[0]}
  value={formData.date}
  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
  required
/>

          </div>

          <div className="mb-4">
            <Label htmlFor="location" className="mb-1 block">Location <span className="text-red-500">*</span></Label>
            <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>

          <div className="mb-4">
  <Label htmlFor="capacity" className="mb-1 block">
    Capacity <span className="text-red-500">*</span>
  </Label>
  <Input
    id="capacity"
    type="number"
    min="0"
    value={formData.capacity}
    onChange={(e) =>
      setFormData({ ...formData, capacity: e.target.value })
    }
  />
</div>


          <div className="mb-4">
            <Label className="mb-1 block">Status</Label>
            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="button" className="w-full" onClick={goToNextStep}>Continue to Donor Selection</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepTwo = () => (
    <>
    {formData.capacity && formData.donors.length > formData.capacity && (
  <div className="p-4 mb-4 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300 text-sm">
    ⚠️ You have selected <strong>{formData.donors.length}</strong> donors, which exceeds the event capacity of <strong>{formData.capacity}</strong>.
  </div>
)}

{formData.capacity && (
  <div className="text-sm text-muted-foreground mb-2">
    Selected <strong>{formData.donors.length}</strong> out of <strong>{formData.capacity}</strong> donors
  </div>
)}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="mb-1">Donor Selection (Optional)</CardTitle>
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
          onChange={(updatedDonors) =>
            setFormData((prev) => ({ ...prev, donors: updatedDonors }))
          }
          
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
      <ConfirmDialog
  open={showOverCapacityDialog}
  onCancel={() => setShowOverCapacityDialog(false)}
  onConfirm={submitEvent}
  title="Exceeds Capacity"
  description={`You have selected ${formData.donors.length} donors, which exceeds the event capacity of ${formData.capacity}. Are you sure you want to continue?`}
  confirmLabel="Continue & Save"
  cancelLabel="Cancel"
  loading={loading}
/>

    </div>
  );
}
