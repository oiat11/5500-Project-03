import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  PlusCircle,
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EditEventDetailsModal from "@/components/EditEventDetailsModal";
import AddDonorsModal from "@/components/AddDonorsModal";

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
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddDonors, setShowAddDonors] = useState(false);

  const [formData, setFormData] = useState({
    donors: [],
    tags: [],
  });

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

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

      setFormData({
        donors: data.event.donors.map((donorEvent) => ({
          value: donorEvent.donor_id,
          label: `${donorEvent.donor.first_name} ${donorEvent.donor.last_name}`,
          tags: donorEvent.donor.tags?.map((t) => t.tag) || [],
          totalDonation: donorEvent.donor.total_donation_amount || 0,
          city: donorEvent.donor.city,
          status: donorEvent.status,
        })),
        tags: data.event.tags.map((tag) => ({
          value: tag.id,
          label: tag.name,
          color: tag.color,
        })),
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

  const handleDonorStatusChange = async (donorId, newStatus) => {
    try {
      setSaving(true);

      // 更新本地状态（前端 UI）
      const updatedDonors = event.donors.map((donor) =>
        donor.donor_id === donorId ? { ...donor, status: newStatus } : donor
      );
      setEvent((prev) => ({
        ...prev,
        donors: updatedDonors,
      }));

      // 向后端发送更新请求（只更新一个 donor 的 status）
      const response = await fetch(`/api/event/${id}/donor-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update donor status");

      toast({
        title: "Status updated",
        description: "Donor status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating donor status:", error);
      toast({
        title: "Error",
        description: "Failed to update donor status",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-xl mb-4">Loading event details...</p>
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

        <h1 className="text-3xl font-bold mb-6">{event.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Event Details</CardTitle>
                {isEventOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEditDetails(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Details
                  </Button>
                )}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Donors
                    <Badge variant="outline" className="ml-2">
                      {event.donors?.length || 0} donors
                    </Badge>
                  </CardTitle>
                  {isEventOwner && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddDonors(true)}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Donors
                    </Button>
                  )}
                </div>
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
                          <TableHead className="w-[30%]">Name</TableHead>
                          <TableHead className="w-[20%]">
                            Donation Amount
                          </TableHead>
                          <TableHead className="w-[15%]">City</TableHead>
                          <TableHead className="w-[40%]">Status</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {event.donors.map((donorEvent) => (
                          <TableRow
                            key={donorEvent.donor_id}
                            className="hover:bg-slate-50"
                          >
                            <TableCell
                              className="font-medium cursor-pointer w-[30%]"
                              onClick={() =>
                                navigate(`/donors/${donorEvent.donor_id}`)
                              }
                            >
                              {`${donorEvent.donor.first_name} ${donorEvent.donor.last_name}`}
                              {donorEvent.donor.tags &&
                                donorEvent.donor.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {donorEvent.donor.tags.map(
                                      (tagItem, index) => {
                                        const tag = tagItem.tag || tagItem;
                                        const tagId =
                                          tag.id || tagItem.tag_id || index;
                                        const tagName = tag.name || "";
                                        const tagColor = tag.color || "#6366f1";

                                        return (
                                          <div
                                            key={tagId}
                                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{
                                              backgroundColor: tagColor,
                                              color: getContrastColor(tagColor),
                                            }}
                                          >
                                            {tagName}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                            </TableCell>
                            <TableCell
                              className="cursor-pointer w-[20%]"
                              onClick={() =>
                                navigate(`/donors/${donorEvent.donor_id}`)
                              }
                            >
                              {donorEvent.donor.total_donation_amount
                                ? `$${parseFloat(
                                    donorEvent.donor.total_donation_amount
                                  ).toLocaleString()}`
                                : "$0"}
                            </TableCell>
                            <TableCell
                              className="cursor-pointer w-[15%]"
                              onClick={() =>
                                navigate(`/donors/${donorEvent.donor_id}`)
                              }
                            >
                              {donorEvent.donor.city
                                ? donorEvent.donor.city.replace(/_/g, " ")
                                : "N/A"}
                            </TableCell>
                            <TableCell
                              className="w-[40%] "
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-block">
                                <Select
                                  value={donorEvent.status}
                                  onValueChange={(value) =>
                                    handleDonorStatusChange(
                                      donorEvent.donor_id,
                                      value
                                    )
                                  }
                                  disabled={!isEventOwner}
                                >
                                  <SelectTrigger className="w-[140px]">
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
                                      {donorEvent.status === "attended" && (
                                        <span className="flex items-center">
                                          <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                                          Attended
                                        </span>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="invited"
                                      className="text-blue-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                        Invited
                                      </span>
                                    </SelectItem>
                                    <SelectItem
                                      value="confirmed"
                                      className="text-green-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                        Confirmed
                                      </span>
                                    </SelectItem>
                                    <SelectItem
                                      value="declined"
                                      className="text-red-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                                        Declined
                                      </span>
                                    </SelectItem>
                                    <SelectItem
                                      value="attended"
                                      className="text-purple-600"
                                    >
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                                        Attended
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
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
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {event.createdBy?.avatar ? (
                        <AvatarImage src={event.createdBy.avatar} />
                      ) : (
                        <AvatarFallback>
                          {event.createdBy?.username?.charAt(0).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>
                      {event.createdBy?.username || `User #${event.created_by}`}
                    </span>
                  </div>
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
                            event.donors.filter((d) => d.status === "invited")
                              .length
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Confirmed</span>
                        <Badge variant="outline" className="bg-green-100">
                          {
                            event.donors.filter((d) => d.status === "confirmed")
                              .length
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Declined</span>
                        <Badge variant="outline" className="bg-red-100">
                          {
                            event.donors.filter((d) => d.status === "declined")
                              .length
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Attended</span>
                        <Badge variant="outline" className="bg-purple-100">
                          {
                            event.donors.filter((d) => d.status === "attended")
                              .length
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
      <EditEventDetailsModal
        open={showEditDetails}
        onClose={() => setShowEditDetails(false)}
        eventData={{ ...event, id }}
        onSave={() => window.location.reload()}
      />
      <AddDonorsModal
        isOpen={showAddDonors}
        onClose={() => setShowAddDonors(false)}
        onAddDonors={(donorsToAdd, donorsToRemove) => {
          const updateDonors = async () => {
            try {
              setLoading(true);

              const payload = [];

              donorsToRemove.forEach((id) =>
                payload.push({ donorId: id, action: "remove" })
              );

              donorsToAdd.forEach((donor) =>
                payload.push({
                  donorId: donor.id,
                  action: "add",
                  status: donor.status || "invited",
                })
              );

              const response = await fetch(`/api/event/${id}/edit-donors`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ donors: payload }),
              });

              if (!response.ok) throw new Error("Failed to update donors");

              toast({
                title: "Success",
                description: "Donors updated successfully.",
              });

              fetchEventDetails(); // Refresh page
            } catch (error) {
              console.error("Error updating donors:", error);
              toast({
                title: "Error",
                description: "Failed to update donors",
                variant: "destructive",
              });
            } finally {
              setLoading(false);
            }
          };

          updateDonors();
        }}
        existingDonors={event.donors.map((d) => ({
          id: d.donor_id,
          ...d.donor,
        }))}
      />
    </div>
  );
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor) {
  if (!hexColor) return "#000000";

  // Remove the # if it exists
  hexColor = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);

  // Calculate brightness (YIQ formula)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black or white depending on brightness
  return yiq >= 128 ? "#000000" : "#ffffff";
}
