import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function UpdateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    tags: [],
    donors: [],
    status: "draft",
    donor_count: 0
  });
  const [originalEvent, setOriginalEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [targetDonorCount, setTargetDonorCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/event/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }

        const data = await response.json();
        const event = data.event;
        setOriginalEvent(event);

        // Format date for input field (YYYY-MM-DD)
        const formattedDate = event.date 
          ? format(new Date(event.date), "yyyy-MM-dd") 
          : "";

        // Format donors for MultiSelect
        const formattedDonors = event.donors.map(donorEvent => ({
          value: donorEvent.donor_id,
          label: donorEvent.donor.organization_name || 
                `${donorEvent.donor.first_name} ${donorEvent.donor.last_name}`,
          tags: donorEvent.donor.tags?.map(t => t.tag) || [],
          totalDonation: donorEvent.donor.total_donation_amount || 0,
          city: donorEvent.donor.city,
          status: donorEvent.status
        }));

        // Format tags for MultiSelect
        const formattedTags = event.tags.map(tag => ({
          value: tag.id,
          label: tag.name,
          color: tag.color
        }));

        setFormData({
          name: event.name || "",
          description: event.description || "",
          date: formattedDate,
          location: event.location || "",
          tags: formattedTags,
          donors: formattedDonors,
          status: event.status || "draft",
          donor_count: event.donor_count || formattedDonors.length
        });
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, toast]);

  // Fetch all tags
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const res = await fetch("/api/tag", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) throw new Error("Failed to fetch tags");
        
        const data = await res.json();
        if (!Array.isArray(data.tags)) throw new Error("Invalid tag data format");
        setTags(data.tags.map(tag => ({
          value: tag.id,
          label: tag.name,
          color: tag.color || "#6366f1"
        })));
        
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load tags. Please try again.");
      } finally {
        setLoadingTags(false);
      }
    };
    
    fetchTags();
  }, []);

  // Search donors
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    
    const fetchSearchResults = async () => {
      setLoadingDonors(true);
      try {
        const res = await fetch(`/api/donor?search=${encodeURIComponent(searchQuery)}&limit=20`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) throw new Error("Failed to search donors");
        
        const data = await res.json();
        const donorsWithDetails = data.donors.map(donor => ({
          value: donor.id,
          label: donor.organization_name || `${donor.first_name} ${donor.last_name}`,
          tags: donor.tags?.map(t => t.tag) || [],
          totalDonation: donor.total_donation_amount || 0,
          city: donor.city
        }));
        setFilteredDonors(donorsWithDetails);
      } catch (err) {
        console.error("Error searching donors:", err);
      } finally {
        setLoadingDonors(false);
      }
    };
    
    const debounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleTagsChange = (selectedTags) => {
    setFormData((prev) => ({
      ...prev,
      tags: selectedTags,
    }));
  };

  const handleStatusChange = (status) => {
    setFormData((prev) => ({
      ...prev,
      status,
    }));
  };

  const addDonor = (donor) => {
    if (!formData.donors.some(d => d.value === donor.value)) {
      setFormData(prev => ({
        ...prev,
        donors: [...prev.donors, donor]
      }));
    }
  };

  const removeDonor = (donorId) => {
    setFormData(prev => ({
      ...prev,
      donors: prev.donors.filter(d => d.value !== donorId)
    }));
  };

  const recommendDonors = async () => {
    setIsRecommending(true);
    setError("");
    
    try {
      const selectedTagIds = formData.tags.map(tag => tag.value);
      
      const response = await fetch("/api/donor/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagIds: selectedTagIds,
          count: targetDonorCount
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get donor recommendations");
      }
      
      const data = await response.json();
      
      // Filter out already selected donors
      const newRecommendations = data.donors.filter(
        rec => !formData.donors.some(d => d.value === rec.value)
      );
      
      if (newRecommendations.length === 0) {
        toast({
          title: "No new recommendations",
          description: "All recommended donors are already selected.",
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        donors: [...prev.donors, ...newRecommendations]
      }));
      
      toast({
        title: "Success",
        description: `Added ${newRecommendations.length} recommended donors.`,
      });
    } catch (err) {
      console.error("Error recommending donors:", err);
      setError("Failed to get donor recommendations. Please try again.");
    } finally {
      setIsRecommending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name) {
      setError("Event name is required");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const eventData = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        tagIds: formData.tags.map(tag => tag.value),
        donors: formData.donors.map(donor => ({
          donorId: donor.value,
          status: donor.status || "invited"
        })),
        status: formData.status,
        donor_count: formData.donor_count || formData.donors.length
      };
      
      const response = await fetch(`/api/event/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update event");
      }
      
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      
      navigate(`/events/${id}`);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/events/${id}`)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Button>
        <h1 className="text-2xl font-bold">Update Event</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Event Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter event name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter event description"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">
                        Event Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter event location"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags</Label>
                    <MultiSelect
                      options={tags}
                      value={formData.tags}
                      onChange={handleTagsChange}
                      placeholder="Select tags..."
                      isLoading={loadingTags}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Donors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  Selected donors: {formData.donors.length}
                </div>
                
                <Tabs defaultValue="selected" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="selected">Selected</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="selected" className="space-y-4">
                    {formData.donors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No donors selected. Use the recommend button or search to add donors.
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px] border rounded-md p-2">
                        <div className="space-y-2">
                          {formData.donors.map(donor => (
                            <div key={donor.value} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex-1">
                                <div className="font-medium">{donor.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {donor.city && <span className="mr-2">{donor.city}</span>}
                                  {donor.totalDonation > 0 && <span>${donor.totalDonation.toLocaleString()}</span>}
                                </div>
                                {donor.tags && donor.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {donor.tags.slice(0, 3).map(tag => (
                                      <Badge 
                                        key={tag.id} 
                                        className="text-xs"
                                        style={{ 
                                          backgroundColor: tag.color ? `${tag.color}20` : undefined,
                                          borderColor: tag.color,
                                          color: tag.color
                                        }}
                                      >
                                        <span 
                                          className="h-2 w-2 rounded-full mr-1" 
                                          style={{ backgroundColor: tag.color }}
                                        />
                                        {tag.name}
                                      </Badge>
                                    ))}
                                    {donor.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">+{donor.tags.length - 3}</Badge>
                                    )}
                                  </div>
                                )}
                                <div className="mt-1">
                                  <Select 
                                    value={donor.status || "invited"} 
                                    onValueChange={(value) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        donors: prev.donors.map(d => 
                                          d.value === donor.value 
                                            ? {...d, status: value} 
                                            : d
                                        )
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="invited">Invited</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="declined">Declined</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeDonor(donor.value)}
                                className="text-red-500"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="targetDonorCount">Recommend donors</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="targetDonorCount"
                            type="number"
                            min="1"
                            max="50"
                            value={targetDonorCount}
                            onChange={(e) => setTargetDonorCount(parseInt(e.target.value))}
                            className="w-20"
                          />
                          <Button 
                            type="button" 
                            onClick={recommendDonors} 
                            disabled={isRecommending}
                            size="sm"
                          >
                            {isRecommending ? "Loading..." : "Recommend"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formData.tags.length === 0 
                          ? "Recommending top donors by donation amount" 
                          : "Recommending donors based on selected tags"}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="search">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search donors..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <ScrollArea className="h-[400px] border rounded-md p-2">
                        {loadingDonors ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Searching donors...
                          </div>
                        ) : filteredDonors.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No donors found matching your search." : "Type to search for donors."}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredDonors.map(donor => {
                              const isSelected = formData.donors.some(d => d.value === donor.value);
                              return (
                                <div key={donor.value} className="flex items-center justify-between p-2 border rounded-md">
                                  <div className="flex-1">
                                    <div className="font-medium">{donor.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {donor.city && <span className="mr-2">{donor.city}</span>}
                                      {donor.totalDonation > 0 && <span>${donor.totalDonation.toLocaleString()}</span>}
                                    </div>
                                    {donor.tags && donor.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {donor.tags.slice(0, 3).map(tag => (
                                          <Badge 
                                            key={tag.id} 
                                            className="text-xs"
                                            style={{ 
                                              backgroundColor: tag.color ? `${tag.color}20` : undefined,
                                              borderColor: tag.color,
                                              color: tag.color
                                            }}
                                          >
                                            <span 
                                              className="h-2 w-2 rounded-full mr-1" 
                                              style={{ backgroundColor: tag.color }}
                                            />
                                            {tag.name}
                                          </Badge>
                                        ))}
                                        {donor.tags.length > 3 && (
                                          <Badge variant="outline" className="text-xs">+{donor.tags.length - 3}</Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => isSelected ? removeDonor(donor.value) : addDonor(donor)}
                                    className={isSelected ? "text-red-500" : "text-green-500"}
                                  >
                                    {isSelected ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Event"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(`/events/${id}`)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${formData.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                      ${formData.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                      ${formData.status === 'archived' ? 'bg-amber-100 text-amber-800' : ''}
                    `}
                  >
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Created</span>
                  <span>
                    {originalEvent?.created_at 
                      ? format(new Date(originalEvent.created_at), "MMM d, yyyy") 
                      : "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Last Updated</span>
                  <span>
                    {originalEvent?.updated_at 
                      ? format(new Date(originalEvent.updated_at), "MMM d, yyyy") 
                      : "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Selected Donors</span>
                  <span className="font-medium">{formData.donors.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Target Count</span>
                  <Input
                    type="number"
                    min="0"
                    className="w-20 text-right"
                    value={formData.donor_count || formData.donors.length}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      donor_count: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 