import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
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

export default function DonorSelection({ selectedDonors, onChange, excludeDonors = [] }) {
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
  const [sortOption, setSortOption] = useState("ml_score");

  const searchInputRef = useRef(null);
  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/donor/recommend", {
        params: {
          count: recommendMode ? (targetDonorCount || 50) : undefined,
          search: debouncedSearch,
          sortBy: recommendMode ? sortOption : undefined,
          ...recommendMode ? activeFilters : {},
          // ✅ 排除已选中或传入的 donors
          excludeIds: [...selectedDonors, ...excludeDonors].map((d) => d.id).join(","),
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
  }, [debouncedSearch, activeFilters, targetDonorCount, sortOption, recommendMode, selectedDonors, excludeDonors]);

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

  // ✅ Sort 切换时也触发推荐刷新
  useEffect(() => {
    if (recommendMode && showDonors) {
      fetchDonors();
    }
  }, [sortOption]);

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
        title: "Nothing to add yet",
        description: "Try generating a list of donors first before using 'Add All'.",
        variant: "default",
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
    setFilteredDonors([]); // ✅ 清空旧数据准备加载新推荐
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setHasFetchedRecommendation(false); // ✅ 强制重新加载
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Donors</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="mb-5 flex gap-2">
  <Input
    id="search"
    ref={searchInputRef}
    placeholder="Search donors..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={handleKeyDown}
    className="flex-1"
  />
  <Button
    type="button"
    variant="outline"
    onClick={() => {
      setSearchTerm("");
      setFilteredDonors([]);
      setShowDonors(false);
    }}
    disabled={!searchTerm}
  >
    Clear
  </Button>
</div>


        <div className="mb-6">
          <DonorFilters
            onFilterChange={setActiveFilters}
            availableFilters={availableFilters}
          />
        </div>

        <div className="flex items-end gap-2 mb-6">
          <div className="flex-1">
            <Label htmlFor="donorCount" className="block mb-2">
              How many donors would you like to see?
            </Label>
            <Input
  id="donorCount"
  type="number"
  className="w-full min-w-[200px]"
  value={targetDonorCount || ""}
  onChange={(e) => setTargetDonorCount(Number(e.target.value) || null)}
/>

          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-sm text-muted-foreground">Find donors by:</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="max-w-[240px]">
                    You can find donors using either:
                    <br />
                    • <strong>ML Suggested Donors</strong> — based on predicted attendance and donation likelihood.
                    <br />
                    • <strong>Total Donation Amount</strong> — ranked by total historical donation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2 items-end">
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] min-w-[160px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml_score">🔍 ML Suggested Donors</SelectItem>
                  <SelectItem value="total_donation_amount">Total Donation Amount</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleRecommendClick}
                disabled={!targetDonorCount}
              >
                Find Donors
              </Button>
            </div>
          </div>
        </div>

        {showDonors && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-base font-semibold">
                {sortOption === "ml_score"
                  ? "ML Suggested Donors"
                  : "Sorted by Total Donation"}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addAllDonors}
                disabled={filteredDonors.length === 0}
              >
                Add All
              </Button>
            </div>

            {filteredDonors.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No donors found. Try adjusting your filters or search keyword.
              </div>
            ) : (
              <DonorList
                donors={filteredDonors}
                onToggle={toggleDonor}
                getActionIcon="add"
                sortOption={sortOption}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
