// DonorSelection.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

import DonorFilters from "@/components/DonorFilters";
import DonorList from "@/components/DonorList";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function DonorSelection({ selectedDonors, onChange }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({});
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [targetDonorCount, setTargetDonorCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDonors, setShowDonors] = useState(false);
  const [recommendMode, setRecommendMode] = useState(false);
  const [hasFetchedRecommendation, setHasFetchedRecommendation] = useState(false);
  const searchInputRef = useRef(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/donor/recommend", {
        params: {
          count: recommendMode ? targetDonorCount || 20 : undefined,
          search: debouncedSearch,
          ...(recommendMode ? activeFilters : {}),
          excludeIds: selectedDonors.map((d) => d.id).join(","),
        },
      });
      setFilteredDonors(response.data.recommended || []);
      setAvailableFilters(response.data.filters || {});
      if (recommendMode) {
        setHasFetchedRecommendation(true);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch donors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeFilters, targetDonorCount, selectedDonors, recommendMode]);

  useEffect(() => {
    if (searchTerm) {
      setRecommendMode(false);
      setShowDonors(true);
      fetchDonors();
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (recommendMode && showDonors && !hasFetchedRecommendation) {
      fetchDonors();
    }
  }, [fetchDonors, showDonors, recommendMode, hasFetchedRecommendation]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchInputRef.current?.blur();
    }
  };

  const toggleDonor = (donor) => {
    const isSelected = selectedDonors.some((d) => d.id === donor.id);
    if (isSelected) {
      onChange(selectedDonors.filter((d) => d.id !== donor.id));
      setFilteredDonors((prev) => [...prev, donor]);
    } else {
      onChange([...selectedDonors, { ...donor, status: "invited" }]);
      setFilteredDonors((prev) => prev.filter((d) => d.id !== donor.id));
    }
  };

  const addAllDonors = () => {
    if (!showDonors || filteredDonors.length === 0) {
      toast({
        title: "No donors to add",
        description: "Please recommend donors first",
        variant: "destructive",
      });
      return;
    }
  
    const newDonors = filteredDonors.filter(
      (d) => !selectedDonors.some((s) => s.id === d.id)
    );
  
    if (newDonors.length === 0) {
      toast({ title: "No new donors", description: "All donors already added." });
      return;
    }

    const updatedDonors = [
      ...selectedDonors,
      ...newDonors.map((d) => ({ ...d, status: "invited" })),
    ];
    onChange(updatedDonors);

    setFilteredDonors((prev) =>
      prev.filter((d) => !newDonors.some((nd) => nd.id === d.id))
    );
  
    toast({
      title: "All donors added",
      description: `Added ${newDonors.length} donors`,
    });
  };
  

  const handleRecommendClick = () => {
    if (!targetDonorCount || targetDonorCount <= 0) {
      toast({
        title: "Invalid number",
        description: "Please enter a valid number of donors to recommend",
        variant: "destructive",
      });
      return;
    }
    setRecommendMode(true);
    setShowDonors(true);
    setHasFetchedRecommendation(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Donors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5">
          <Input
            id="search"
            ref={searchInputRef}
            placeholder="Search donors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="mb-6">
          <DonorFilters
            onFilterChange={setActiveFilters}
            availableFilters={availableFilters}
          />
        </div>

        <div className="flex items-end gap-2 mb-6">
          <div className="flex-1">
            <Label htmlFor="donorCount" className="block mb-2">Target Number of Donors</Label>
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
              onClick={handleRecommendClick}
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
          <div className="mt-4">
            {filteredDonors.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No donors found. Try adjusting your filters or search keyword.
              </div>
            ) : (
              <DonorList
                donors={filteredDonors}
                onToggle={toggleDonor}
                getActionIcon="add"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}