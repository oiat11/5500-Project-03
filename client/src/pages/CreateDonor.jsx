import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

export default function CreateDonor() {
  const navigate = useNavigate();
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
    pmm: "",
    exclude: false,
    deceased: false,
    contact_phone_type: "mobile",
    phone_restrictions: "",
    email_restrictions: "",
    communication_restrictions: "",
    subscription_events_in_person: "opt_in",
    subscription_events_magazine: "opt_in",
    communication_preference: "Thank_you"
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Process numeric values
    const processedData = {
      ...formData,
      total_donation_amount: formData.total_donation_amount ? parseFloat(formData.total_donation_amount) : 0,
      total_pledge: formData.total_pledge ? parseFloat(formData.total_pledge) : null,
      largest_gift_amount: formData.largest_gift_amount ? parseFloat(formData.largest_gift_amount) : null,
      last_gift_amount: formData.last_gift_amount ? parseFloat(formData.last_gift_amount) : null,
      first_gift_date: formData.first_gift_date ? new Date(formData.first_gift_date).toISOString() : null,
    };

    try {
      const response = await axios.post("/api/donor/", processedData, {
        withCredentials: true
      });

      if (response.data) {
        setSuccessMessage("Donor created successfully!");
        navigate("/donors");
      }
    } catch (error) {
      console.error("Error creating donor:", error);
      setErrorMessage(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create New Donor</h1>
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="first_name" className="mb-1">First Name</Label>
            <Input id="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="last_name" className="mb-1">Last Name</Label>
            <Input id="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nick_name" className="mb-1">Nick Name (optional)</Label>
            <Input id="nick_name" value={formData.nick_name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="organization_name" className="mb-1">Organization Name (optional)</Label>
            <Input id="organization_name" value={formData.organization_name} onChange={handleChange} />
          </div>
        </div>
        <div>
          <Label htmlFor="street_address" className="mb-1">Street Address</Label>
          <Input id="street_address" value={formData.street_address} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="unit_number" className="mb-1">Unit Number</Label>
          <Input id="unit_number" value={formData.unit_number} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="city" className="mb-1">City</Label>
          <Select 
            id="city" 
            value={formData.city} 
            onValueChange={(value) => handleSelectChange("city", value)}
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
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="total_donation_amount" className="mb-1">Total Donation Amount</Label>
            <Input id="total_donation_amount" type="number" step="0.01" value={formData.total_donation_amount} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="total_pledge" className="mb-1">Total Pledge</Label>
            <Input id="total_pledge" type="number" step="0.01" value={formData.total_pledge} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="largest_gift_amount" className="mb-1">Largest Gift Amount</Label>
            <Input id="largest_gift_amount" type="number" step="0.01" value={formData.largest_gift_amount} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="largest_gift_appeal" className="mb-1">Largest Gift Appeal</Label>
            <Input id="largest_gift_appeal" value={formData.largest_gift_appeal} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="last_gift_amount" className="mb-1">Last Gift Amount</Label>
            <Input id="last_gift_amount" type="number" step="0.01" value={formData.last_gift_amount} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="last_gift_request" className="mb-1">Last Gift Request</Label>
            <Input id="last_gift_request" value={formData.last_gift_request} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="last_gift_appeal" className="mb-1">Last Gift Appeal</Label>
            <Input id="last_gift_appeal" value={formData.last_gift_appeal} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="first_gift_date" className="mb-1">First Gift Date</Label>
            <Input id="first_gift_date" type="date" value={formData.first_gift_date} onChange={handleChange} />
          </div>
        </div>
        <div>
          <Label htmlFor="pmm" className="mb-1">PMM</Label>
          <Input id="pmm" value={formData.pmm} onChange={handleChange} required />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="exclude" checked={formData.exclude} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, exclude: checked }))} />
          <Label htmlFor="exclude">This donor should be excluded from all communications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="deceased" checked={formData.deceased} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, deceased: checked }))} />
          <Label htmlFor="deceased">This donor is deceased</Label>
        </div>
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
        <Button type="submit" className="w-full mt-4">Submit</Button>
      </form>
    </div>
  );
}