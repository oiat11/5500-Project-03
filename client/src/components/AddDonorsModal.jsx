import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import DonorFilters from "@/components/DonorFilters";
import CurrentDonorsList from "@/components/CurrentDonorsList";
import DonorSelection from "@/components/DonorSelection";

// Helper function to determine text color based on background color
function getContrastColor(hexColor) {
  if (!hexColor) return '#000000';
  
  // Remove the # if it exists
  hexColor = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calculate brightness (YIQ formula)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Return black or white depending on brightness
  return yiq >= 128 ? '#000000' : '#ffffff';
}

export default function AddDonorsModal({ 
  isOpen, 
  onClose, 
  onAddDonors, 
  existingDonors = [] 
}) {
  const { toast } = useToast();
  const [targetDonorCount, setTargetDonorCount] = useState(null);
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [removedExistingDonors, setRemovedExistingDonors] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({});
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("total_donation_amount");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDonors, setShowDonors] = useState(false);

  // Format existing donors for display
  const formattedExistingDonors = existingDonors
    .map(donor => {
      const name = donor.organization_name || `${donor.first_name} ${donor.last_name}`;
      return {
        id: donor.id,
        name: name,
        label: name,
        email: donor.email,
        total_donation_amount: donor.total_donation_amount,
        city: donor.city,
        status: donor.status || "invited",
        isExisting: true,
        tags: donor.tags || []
      };
    })
    .filter(donor => !removedExistingDonors.includes(donor.id));

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDonors([]);
      setRemovedExistingDonors([]);
      setSearchTerm("");
      setActiveFilters({});
      setShowDonors(false);
      setError("");
    }
  }, [isOpen]);

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

      // Apply client-side filtering
      let filteredResults = response.data.donors;

      // Filter out donors that are already in the event and not removed
      const existingDonorIds = existingDonors
        .filter(donor => !removedExistingDonors.includes(donor.id))
        .map(donor => donor.id);
      
      filteredResults = filteredResults.filter(
        donor => !existingDonorIds.includes(donor.id)
      );

      // Apply tag filter if needed
      if (activeFilters.tag) {
        filteredResults = filteredResults.filter(
          (donor) =>
            donor.tags &&
            donor.tags.some(
              (tag) =>
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
  }, [searchTerm, activeFilters, sortBy, sortOrder, existingDonors, removedExistingDonors]);

  useEffect(() => {
    if (isOpen) {
      fetchDonors();
    }
  }, [fetchDonors, isOpen, removedExistingDonors]);

  const handleFilterChange = useCallback((newFilters) => {
    setActiveFilters(newFilters);
  }, []);

  const toggleDonor = (donor) => {
    const isSelected = selectedDonors.some((d) => d.id === donor.id);
    setSelectedDonors((prev) =>
      isSelected
        ? prev.filter((d) => d.id !== donor.id)
        : [...prev, { ...donor, status: "invited" }]
    );
  };

  const removeDonor = (donorId) => {
    setSelectedDonors((prev) => prev.filter((d) => d.id !== donorId));
  };

  const removeExistingDonor = (donorId) => {
    setRemovedExistingDonors(prev => [...prev, donorId]);
  };

  const handleDonorStatusChange = (donorId, status) => {
    setSelectedDonors((prev) =>
      prev.map((donor) =>
        (donor.id || donor.value) === donorId ? { ...donor, status } : donor
      )
    );
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
      setShowDonors(true);

      // Get top donors based on donation amount and sort them
      const topDonors = filteredDonors
        .sort(
          (a, b) =>
            (b.total_donation_amount || 0) - (a.total_donation_amount || 0)
        )
        .slice(0, targetDonorCount);

      setFilteredDonors(topDonors);
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

  const addAllDonors = () => {
    if (!showDonors || filteredDonors.length === 0) {
      toast({
        title: "No donors to add",
        description: "Please recommend donors first",
        variant: "destructive",
      });
      return;
    }

    setSelectedDonors(filteredDonors.map((donor) => ({ ...donor, status: "invited" })));

    toast({
      title: "All donors added",
      description: `Added ${filteredDonors.length} donors to your selection`,
    });
  };

  const clearAllDonors = () => {
    setSelectedDonors([]);
    setRemovedExistingDonors([]);
    toast({
      title: "Donors cleared",
      description: "All donors have been reset to original state",
    });
  };

  const handleSubmit = () => {
    // Prepare data for submission
    const donorsToAdd = selectedDonors;
    const donorsToRemove = removedExistingDonors;
    
    if (donorsToAdd.length === 0 && donorsToRemove.length === 0) {
      toast({
        title: "No changes made",
        description: "Please add or remove donors before submitting",
        variant: "destructive",
      });
      return;
    }

    onAddDonors(donorsToAdd, donorsToRemove);
    onClose();
  };

  // Render all donors in a consistent format
  const renderDonorsList = () => {
    // Format selected donors to ensure they have the right properties
    const formattedSelectedDonors = selectedDonors.map(donor => {
      const name = donor.organization_name || 
                  (donor.first_name && donor.last_name ? 
                    `${donor.first_name} ${donor.last_name}` : 
                    donor.name || donor.label || "Unknown");
      
      return {
        ...donor,
        label: name,
        name: name
      };
    });
    
    const allSelectedDonors = [
      ...formattedSelectedDonors,
      ...formattedExistingDonors
    ];
    
    return (
      <div className="space-y-4">
        <CurrentDonorsList
          donors={allSelectedDonors}
          onRemove={(donor) => donor.isExisting ? removeExistingDonor(donor.id) : removeDonor(donor.id)}
          onStatusChange={handleDonorStatusChange}
        />
        
        {/* Removed donors count */}
        {removedExistingDonors.length > 0 && (
          <div className="mt-4 text-sm text-red-500">
            {removedExistingDonors.length} donor(s) will be removed from the event
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden flex flex-col max-h-[90vh]"
        style={{ width: '90vw', maxWidth: '1400px' }}
      >
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">Add Donors to Event</DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Donor search and filters */}
            <div>
              <h3 className="text-base font-semibold mb-3">Find Donors</h3>
              
              <div className="mb-4">
                <Label htmlFor="search" className="mb-1 block">Search donors</Label>
                <Input
                  id="search"
                  placeholder="Search by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Filters</h4>
                <Card>
                  <CardContent className="p-3">
                    <DonorFilters
                      onFilterChange={handleFilterChange}
                      availableFilters={availableFilters}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="mb-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <Label
                      htmlFor="donorCount"
                      className="mb-1 block"
                    >
                      Target Number of Donors to Include
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
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
                      <Button
                        type="button"
                        onClick={recommendDonors}
                        disabled={!targetDonorCount || targetDonorCount <= 0}
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
                </div>
              </div>

              {showDonors && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Available Donors</h4>
                  <ScrollArea className="h-[300px] border rounded-md p-2">
                    <DonorSelection
                      donors={filteredDonors}
                      selectedDonors={selectedDonors}
                      onToggle={toggleDonor}
                    />
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Right side - Combined donors list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">
                  Selected Donors ({selectedDonors.length + formattedExistingDonors.length})
                </h3>
                {(selectedDonors.length > 0 || removedExistingDonors.length > 0) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllDonors}
                  >
                    Reset Changes
                  </Button>
                )}
              </div>
              
              <Card>
                <CardContent className="p-3">
                  {renderDonorsList()}
                </CardContent>
              </Card>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        <DialogFooter className="p-4 pt-2 border-t mt-auto">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (selectedDonors.length === 0 && removedExistingDonors.length === 0)}
          >
            {loading ? "Processing..." : 
              `${selectedDonors.length > 0 ? `Add ${selectedDonors.length} Donors` : ''} 
               ${selectedDonors.length > 0 && removedExistingDonors.length > 0 ? ' & ' : ''}
               ${removedExistingDonors.length > 0 ? `Remove ${removedExistingDonors.length} Donors` : ''}
               ${selectedDonors.length === 0 && removedExistingDonors.length === 0 ? 'Save Changes' : ''}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
