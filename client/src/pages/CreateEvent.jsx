import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, UserPlus, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function CreateEvent() {
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [targetDonorCount, setTargetDonorCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);

  // 获取所有标签
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

  // 当搜索查询变化时过滤捐赠者
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    
    const fetchSearchResults = async () => {
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

  const handleDonorsChange = (selectedDonors) => {
    setFormData((prev) => ({
      ...prev,
      donors: selectedDonors,
    }));
  };

  const handleStatusChange = (status) => {
    setFormData((prev) => ({
      ...prev,
      status,
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
        throw new Error("Failed to get recommendations");
      }
      
      const data = await response.json();
      setFormData(prev => ({ 
        ...prev, 
        donors: data.donors,
        donor_count: data.donors.length
      }));
      
      toast({
        title: "Success",
        description: `${data.donors.length} donors recommended based on your criteria.`,
      });
    } catch (err) {
      console.error("Error getting recommendations:", err);
      setError("Failed to get donor recommendations. Please try again.");
    } finally {
      setIsRecommending(false);
    }
  };

  const addDonor = (donor) => {
    if (!formData.donors.some(d => d.value === donor.value)) {
      const updatedDonors = [...formData.donors, donor];
      setFormData(prev => ({
        ...prev,
        donors: updatedDonors,
        donor_count: updatedDonors.length
      }));
    }
  };

  const removeDonor = (donorId) => {
    const updatedDonors = formData.donors.filter(d => d.value !== donorId);
    setFormData(prev => ({
      ...prev,
      donors: updatedDonors,
      donor_count: updatedDonors.length
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.name) {
        throw new Error("Event name is required");
      }

      const eventData = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        status: formData.status,
        donor_count: formData.donors.length,
        tagIds: formData.tags.map(tag => tag.value),
        donors: formData.donors.map(donor => ({
          donorId: donor.value,
          status: "invited"
        }))
      };

      const res = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      navigate("/events");
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={formData.date} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location} onChange={handleChange} />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  id="status" 
                  value={formData.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <MultiSelect
                  id="tags"
                  isLoading={loadingTags}
                  options={tags}
                  value={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Select tags..."
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Event"}
                </Button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </CardContent>
          </Card>
          
          {/* 右侧：捐赠者选择 */}
          <Card>
            <CardHeader>
              <CardTitle>Donor Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="targetDonorCount">Target Number of Donors</Label>
                  <Input 
                    id="targetDonorCount" 
                    type="number" 
                    min="1"
                    value={targetDonorCount} 
                    onChange={(e) => setTargetDonorCount(parseInt(e.target.value) || 10)} 
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={recommendDonors} 
                    disabled={isRecommending}
                    className="w-full"
                  >
                    {isRecommending ? "Recommending..." : "Recommend Donors"}
                  </Button>
                </div>
              </div>
              
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
                      {filteredDonors.length === 0 ? (
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
      </form>
    </div>
  );
}
