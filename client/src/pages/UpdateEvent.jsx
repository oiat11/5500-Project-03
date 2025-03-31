import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, Calendar, MapPin, Tag, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import DonorSelection from "@/components/DonorSelection";
import { Separator } from "@/components/ui/separator";
import CurrentDonorsList from "@/components/CurrentDonorsList";

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

        const formattedDate = event.date 
          ? format(new Date(event.date), "yyyy-MM-dd") 
          : "";

        const formattedDonors = event.donors.map(donorEvent => ({
          value: donorEvent.donor_id,
          label: donorEvent.donor.organization_name || 
                `${donorEvent.donor.first_name} ${donorEvent.donor.last_name}`,
          tags: donorEvent.donor.tags?.map(t => t.tag) || [],
          totalDonation: donorEvent.donor.total_donation_amount || 0,
          city: donorEvent.donor.city,
          status: donorEvent.status
        }));

        const formattedTags = event.tags.map(tag => ({
          value: tag.id,
          label: tag.name,
          color: tag.color
        }));

        setFormData({
          name: event.name,
          description: event.description || "",
          date: formattedDate,
          location: event.location || "",
          tags: formattedTags,
          donors: formattedDonors,
          status: event.status,
          donor_count: event.donor_count || formattedDonors.length
        });
      } catch (err) {
        console.error("Error fetching event:", err);
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        });
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, navigate, toast]);

  // Fetch all tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const response = await fetch("/api/tag");
        const data = await response.json();
        setTags(data.tags.map(tag => ({
          value: tag.id,
          label: tag.name,
          color: tag.color
        })));
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Handle donor status change
  const handleDonorStatusChange = (donorId, newStatus) => {
    setFormData(prev => ({
      ...prev,
      donors: prev.donors.map(donor =>
        donor.value === donorId ? { ...donor, status: newStatus } : donor
      )
    }));
  };

  const handleRemoveDonor = (donor) => {
    setFormData(prev => ({
      ...prev,
      donors: prev.donors.filter(d => d.value !== donor.value)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/event/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date ? new Date(formData.date).toISOString() : null,
          tagIds: formData.tags.map(tag => tag.value),
          donors: formData.donors.map(donor => ({
            donorId: donor.value,
            status: donor.status
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      navigate(`/events/${id}`);
    } catch (err) {
      console.error("Error updating event:", err);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/events/${id}`)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              {submitting ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Event Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Event Name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Event Description"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Event Location"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="w-full">
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
                      <Label htmlFor="tags" className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </Label>
                      <MultiSelect
                        id="tags"
                        isLoading={loadingTags}
                        options={tags}
                        value={formData.tags}
                        onChange={(selected) => setFormData({ ...formData, tags: selected })}
                        placeholder="Select tags..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Donors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Current Donors ({formData.donors.length})
                </CardTitle>
                <CardDescription>
                  Manage donors for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CurrentDonorsList 
                  donors={formData.donors} 
                  onStatusChange={handleDonorStatusChange} 
                  onRemove={handleRemoveDonor} 
                />
              </CardContent>
            </Card>

            {/* Donor Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Add Donors</CardTitle>
                <CardDescription>
                  Search or get recommendations for donors to add to this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonorSelection formData={formData} setFormData={setFormData} tags={tags} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Status</h3>
                  <Badge className="mt-1" variant={
                    formData.status === "published" ? "default" :
                    formData.status === "draft" ? "outline" : "secondary"
                  }>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Donor Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Total</span>
                      <Badge variant="outline">{formData.donors.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Invited</span>
                      <Badge variant="outline" className="bg-blue-100">
                        {formData.donors.filter(d => d.status === "invited").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Confirmed</span>
                      <Badge variant="outline" className="bg-green-100">
                        {formData.donors.filter(d => d.status === "confirmed").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Declined</span>
                      <Badge variant="outline" className="bg-red-100">
                        {formData.donors.filter(d => d.status === "declined").length}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.length > 0 ? (
                      formData.tags.map(tag => (
                        <Badge
                          key={tag.value}
                          variant="outline"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : undefined,
                            borderColor: tag.color,
                            color: tag.color
                          }}
                        >
                          {tag.label}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No tags selected</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
