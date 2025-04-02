import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  MapPin,
  Tag,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEventOwner, setIsEventOwner] = useState(false);
  
  // 添加这些状态用于 DonorSelection 组件
  const [formData, setFormData] = useState({
    donors: [],
    tags: []
  });
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/event/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }

        const data = await response.json();
        setEvent(data.event);
        setIsEventOwner(data.isEventOwner);
        
        // 设置 formData 以便 DonorSelection 组件使用
        setFormData({
          donors: data.event.donors.map(donorEvent => ({
            value: donorEvent.donor_id,
            label: donorEvent.donor.organization_name || 
                  `${donorEvent.donor.first_name} ${donorEvent.donor.last_name}`,
            tags: donorEvent.donor.tags?.map(t => t.tag) || [],
            totalDonation: donorEvent.donor.total_donation_amount || 0,
            city: donorEvent.donor.city,
            status: donorEvent.status
          })),
          tags: data.event.tags.map(tag => ({
            value: tag.id,
            label: tag.name,
            color: tag.color
          }))
        });
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id, toast]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/event/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      navigate("/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case "published":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            <XCircle className="h-3 w-3 mr-1" />
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <HelpCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const getParticipationStatusBadge = (status) => {
    switch (status) {
      case "invited":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Invited
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Confirmed
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Declined
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  // Update the handleDonorStatusChange function to use the event update endpoint
  const handleDonorStatusChange = async (donorId, newStatus) => {
    try {
      setLoading(true);
      
      // First, update the local state for immediate feedback
      const updatedDonors = event.donors.map(donor => 
        donor.donor_id === donorId 
          ? { ...donor, status: newStatus } 
          : donor
      );
      
      setEvent(prev => ({
        ...prev,
        donors: updatedDonors
      }));
      
      // Then send the update to the server using the event update endpoint
      const response = await fetch(`/api/event/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Include all event data to avoid losing information
          name: event.name,
          description: event.description,
          date: event.date,
          location: event.location,
          status: event.status,
          // Send the updated donors array with the new status
          donors: updatedDonors.map(donor => ({
            donorId: donor.donor_id,
            status: donor.status
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update donor status");
      }

      toast({
        title: "Status updated",
        description: "Donor status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating donor status:", error);
      
      // Revert the local state change if the API call fails
      setEvent(prev => ({
        ...prev,
        donors: prev.donors.map(donor => 
          donor.donor_id === donorId 
            ? { ...donor, status: donor.status } // Revert to original status
            : donor
        )
      }));
      
      toast({
        title: "Error",
        description: "Failed to update donor status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Event not found"}</p>
            <Button onClick={() => navigate("/events")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
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
              onClick={() => navigate("/events")}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Only show edit and delete buttons if the user is the event owner */}
            {isEventOwner && (
              <>
                <Button
                  variant="default"
                  onClick={() => navigate(`/events/${id}/edit`)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit Event
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialog(true)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 添加事件名称标题 */}
        <h1 className="text-3xl font-bold mb-6">{event.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {event.date
                          ? format(new Date(event.date), "PPP")
                          : "No date set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {event.location || "No location set"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {event.description || "No description provided."}
                  </p>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            className="flex items-center gap-1"
                            style={{
                              backgroundColor: tag.color
                                ? `${tag.color}20`
                                : undefined,
                              borderColor: tag.color,
                              color: tag.color || "currentColor",
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: tag.color || "currentColor",
                              }}
                            />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Donor List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Donors
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {event.donors?.length || 0} donors
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Donors invited to this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!event.donors || event.donors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No donors associated with this event.
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Donation Amount</TableHead>
                          <TableHead>City</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {event.donors.map((donorEvent) => (
                          <TableRow
                            key={donorEvent.donor_id}
                            className="hover:bg-slate-50"
                          >
                            <TableCell 
                              className="font-medium cursor-pointer"
                              onClick={() => navigate(`/donors/${donorEvent.donor_id}`)}
                            >
                              {donorEvent.donor.organization_name ||
                                `${donorEvent.donor.first_name} ${donorEvent.donor.last_name}`}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={donorEvent.status}
                                onValueChange={(value) => handleDonorStatusChange(donorEvent.donor_id, value)}
                                disabled={!isEventOwner}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue>
                                    {donorEvent.status === "invited" && (
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                        Invited
                                      </span>
                                    )}
                                    {donorEvent.status === "confirmed" && (
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                        Confirmed
                                      </span>
                                    )}
                                    {donorEvent.status === "declined" && (
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                                        Declined
                                      </span>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="invited" className="text-blue-600">
                                    <span className="flex items-center">
                                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                      Invited
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="confirmed" className="text-green-600">
                                    <span className="flex items-center">
                                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                      Confirmed
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="declined" className="text-red-600">
                                    <span className="flex items-center">
                                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                                      Declined
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell 
                              className="cursor-pointer"
                              onClick={() => navigate(`/donors/${donorEvent.donor_id}`)}
                            >
                              {donorEvent.donor.total_donation_amount
                                ? `$${parseFloat(donorEvent.donor.total_donation_amount).toLocaleString()}`
                                : "$0"}
                            </TableCell>
                            <TableCell 
                              className="cursor-pointer"
                              onClick={() => navigate(`/donors/${donorEvent.donor_id}`)}
                            >
                              {donorEvent.donor.city
                                ? donorEvent.donor.city.replace(/_/g, " ")
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span>{getStatusBadge(event.status)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Created By</span>
                  <span>{event.creator?.username || `User #${event.created_by}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Created</span>
                  <span>
                    {format(new Date(event.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Last Updated</span>
                  <span>
                    {format(new Date(event.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donor Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!event.donors || event.donors.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No donors to display
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Invited</span>
                        <Badge variant="outline" className="bg-blue-100">
                          {
                            event.donors.filter(
                              (d) => d.status === "invited"
                            ).length
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Confirmed</span>
                        <Badge variant="outline" className="bg-green-100">
                          {
                            event.donors.filter(
                              (d) => d.status === "confirmed"
                            ).length
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Declined</span>
                        <Badge variant="outline" className="bg-red-100">
                          {
                            event.donors.filter(
                              (d) => d.status === "declined"
                            ).length
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 