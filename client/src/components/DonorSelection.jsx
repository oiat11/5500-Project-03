import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DonorSelection({ formData, setFormData, tags }) {
  const [targetDonorCount, setTargetDonorCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(false);

  // Handle search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDonors([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoadingDonors(true);
        const response = await fetch(`/api/donor/search?query=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          throw new Error("Failed to search donors");
        }
        
        const data = await response.json();
        
        // Format donors for display
        const formattedDonors = data.donors.map(donor => ({
          value: donor.id,
          label: donor.organization_name || `${donor.first_name} ${donor.last_name}`,
          tags: donor.tags?.map(t => t.tag) || [],
          totalDonation: donor.total_donation_amount || 0,
          city: donor.city
        }));
        
        setFilteredDonors(formattedDonors);
      } catch (error) {
        console.error("Error searching donors:", error);
      } finally {
        setLoadingDonors(false);
      }
    };

    // Debounce search requests
    const debounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleRecommendDonors = async () => {
    try {
      setIsRecommending(true);
      const response = await fetch("/api/donor/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagIds: formData.tags.map(tag => tag.value),
          count: targetDonorCount
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get donor recommendations");
      }

      const data = await response.json();
      const existingDonorIds = formData.donors.map(d => d.value);
      const newRecommendedDonors = data.donors.filter(
        donor => !existingDonorIds.includes(donor.value)
      );

      setFilteredDonors(newRecommendedDonors);

      if (newRecommendedDonors.length === 0) {
        console.log("No new donors found matching these criteria");
      }
    } catch (error) {
      console.error("Error recommending donors:", error);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleToggleDonor = (donor, e) => {
    // 防止事件冒泡和表单提交
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isSelected = formData.donors.some(d => d.value === donor.value);
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        donors: prev.donors.filter(d => d.value !== donor.value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        donors: [...prev.donors, {
          ...donor,
          status: "invited"
        }]
      }));
    }
  };

  const handleAddAllDonors = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (filteredDonors.length === 0) return;
    
    // 获取当前未选择的捐赠者
    const existingDonorIds = formData.donors.map(d => d.value);
    const newDonors = filteredDonors.filter(donor => !existingDonorIds.includes(donor.value));
    
    if (newDonors.length === 0) return;
    
    // 添加所有新捐赠者
    setFormData(prev => ({
      ...prev,
      donors: [
        ...prev.donors,
        ...newDonors.map(donor => ({
          ...donor,
          status: "invited"
        }))
      ]
    }));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="recommend">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommend">Recommend Donors</TabsTrigger>
          <TabsTrigger value="search">Search Donors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommend" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="20"
              value={targetDonorCount}
              onChange={(e) => setTargetDonorCount(parseInt(e.target.value) || 5)}
              className="w-20"
            />
            <Button 
              type="button"
              onClick={handleRecommendDonors}
              disabled={isRecommending}
              className="flex-1"
            >
              {isRecommending ? "Finding..." : "Recommend Donors"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAllDonors}
              disabled={filteredDonors.length === 0}
            >
              Add All
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Recommendations are based on selected tags
          </p>
          <DonorList 
            donors={filteredDonors} 
            selectedDonors={formData.donors} 
            onToggle={handleToggleDonor} 
            loading={loadingDonors}
            emptyMessage="No recommendations available"
          />
        </TabsContent>
        
        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            {searchQuery && (
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DonorList 
            donors={filteredDonors} 
            selectedDonors={formData.donors} 
            onToggle={handleToggleDonor} 
            loading={loadingDonors}
            emptyMessage={searchQuery ? "No donors found" : "Type to search donors"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for displaying donor list
function DonorList({ donors, selectedDonors, onToggle, loading, emptyMessage }) {
  return (
    <ScrollArea className="h-[300px] border rounded-md">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p>Loading donors...</p>
        </div>
      ) : donors.length > 0 ? (
        <div className="p-2 space-y-1">
          {donors.map((donor) => {
            const isSelected = selectedDonors.some(d => d.value === donor.value);
            return (
              <div
                key={donor.value}
                className={`flex justify-between items-center p-2 rounded-md ${
                  isSelected ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{donor.label}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {donor.city && <span className="mr-2">{donor.city}</span>}
                    {donor.totalDonation > 0 && (
                      <span>${donor.totalDonation.toLocaleString()}</span>
                    )}
                  </div>
                  {donor.tags && donor.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {donor.tags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : undefined,
                            borderColor: tag.color,
                            color: tag.color
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => onToggle(donor, e)}
                >
                  {isSelected ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full text-muted-foreground p-4">
          {emptyMessage}
        </div>
      )}
    </ScrollArea>
  );
} 