// DonorSelection.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

import DonorFilters from "@/components/DonorFilters";
import DonorList from "@/components/DonorList";

export default function DonorSelection({ selectedDonors, onChange }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({});
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [targetDonorCount, setTargetDonorCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDonors, setShowDonors] = useState(false);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/donor/recommend", {
        params: {
          count: targetDonorCount || 20,
          search: searchTerm,
          ...activeFilters,
          excludeIds: selectedDonors.map((d) => d.id).join(","),
        },
      });
      setFilteredDonors(response.data.recommended || []);
      setAvailableFilters(response.data.filters || {});
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch donors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilters, targetDonorCount, selectedDonors]);

  useEffect(() => {
    if (showDonors) fetchDonors();
  }, [fetchDonors, showDonors]);

  const toggleDonor = (donor) => {
    const isSelected = selectedDonors.some((d) => d.id === donor.id);
    if (isSelected) {
      onChange(selectedDonors.filter((d) => d.id !== donor.id));
    } else {
      onChange([...selectedDonors, { ...donor, status: "invited" }]);
      setFilteredDonors((prev) => prev.filter((d) => d.id !== donor.id));
    }
  };

  const addAllDonors = () => {
    if (!showDonors || filteredDonors.length === 0) {
      toast({ title: "No donors to add", description: "Please recommend donors first", variant: "destructive" });
      return;
    }
    onChange([...selectedDonors, ...filteredDonors.map((d) => ({ ...d, status: "invited" }))]);
    setFilteredDonors([]);
    toast({ title: "All donors added", description: `Added ${filteredDonors.length} donors` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Donors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-">
          <Label htmlFor="search" className="block mb-3">Search Donors</Label>
          <Input
            id="search"
            placeholder="Search donors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <DonorFilters
            onFilterChange={setActiveFilters}
            availableFilters={availableFilters}
          />
        </div>

        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <Label htmlFor="donorCount" className="block mb-1">Target Number of Donors</Label>
            <Input
              id="donorCount"
              type="number"
              value={targetDonorCount || ""}
              onChange={(e) => setTargetDonorCount(Number(e.target.value) || null)}
            />
          </div>
          <div className="flex gap-2 pt-6">
            <Button
              type="button"
              onClick={() => {
                setShowDonors(true);
                fetchDonors();
              }}
              disabled={!targetDonorCount}
            >
              Recommend
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
          <DonorList
            donors={filteredDonors}
            onToggle={toggleDonor}
            getActionIcon="add"
          />
        )}
      </CardContent>
    </Card>
  );
}