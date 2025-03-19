import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function CreateDonor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    age: "",
    email: "",
    phone_number: "",
    address: "",
    registration_date: "",
    last_donation_date: "",
    total_donation_amount: "",
    total_donations_count: "",
    anonymous_donation_preference: false,
    interest_domain: "",
    communication_preference: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Convert age to a number and handle empty date strings
    const processedData = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null,
      last_donation_date: formData.last_donation_date || null,
      registration_date: formData.registration_date || null,
    };

    try {
      const response = await fetch("/api/donor/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error("Failed to create donor");
      }

      setSuccessMessage("Donor created successfully!");
      navigate("/donors");
    } catch (error) {
      console.error("Error creating donor:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create New Donor</h1>
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name" className="mb-1">First Name</Label>
            <Input id="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="middle_name" className="mb-1">Middle Name</Label>
            <Input id="middle_name" value={formData.middle_name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="last_name" className="mb-1">Last Name</Label>
            <Input id="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="gender" className="mb-1">Gender</Label>
            <select id="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-md p-2 text-sm">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non Binary">Non Binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <Label htmlFor="age" className="mb-1">Age</Label>
            <Input id="age" type="number" value={formData.age} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email" className="mb-1">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone_number" className="mb-1">Phone Number</Label>
            <Input id="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="address" className="mb-1">Address</Label>
            <Input id="address" value={formData.address} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="registration_date" className="mb-1">Registration Date</Label>
            <Input id="registration_date" type="date" value={formData.registration_date} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="last_donation_date" className="mb-1">Last Donation Date</Label>
            <Input id="last_donation_date" type="date" value={formData.last_donation_date} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="total_donation_amount" className="mb-1">Total Donation Amount</Label>
            <Input id="total_donation_amount" type="number" value={formData.total_donation_amount} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="total_donations_count" className="mb-1">Total Donations Count</Label>
            <Input id="total_donations_count" type="number" value={formData.total_donations_count} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="interest_domain" className="mb-1">Interest Domain</Label>
            <Input id="interest_domain" value={formData.interest_domain} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="communication_preference" className="mb-1">Communication Preference</Label>
            <Input id="communication_preference" value={formData.communication_preference} onChange={handleChange} />
          </div>
          <div className="flex items-center">
            <input id="anonymous_donation_preference" type="checkbox" checked={formData.anonymous_donation_preference} onChange={handleChange} className="mr-2" />
            <Label htmlFor="anonymous_donation_preference">Donor prefers to remain anonymous</Label>
          </div>
        </div>
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
        <Button type="submit" className="w-full mt-4">Submit</Button>
      </form>
    </div>
  );
}