import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import axios from "axios";
import { format } from "date-fns";
import { 
  User, 
  Home, 
  DollarSign, 
  Mail, 
  Tag, 
  Edit, 
  Trash2, 
  ArrowLeft,
  PlusCircle 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";

axios.defaults.withCredentials = true;

export default function DonorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [newTagDialog, setNewTagDialog] = useState(false);
  const [newTag, setNewTag] = useState({ name: "", color: "#6366f1" });

  useEffect(() => {
    fetchDonorDetails();
    fetchAllTags();
  }, [id]);

  const fetchDonorDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/donor/${id}`, {
        withCredentials: true
      });
      
      const donorData = response.data;
      setDonor(donorData);
      
      const formattedTags = donorData.tags ? donorData.tags.map(tagLink => ({
        value: tagLink.tag.id,
        label: tagLink.tag.name,
        color: tagLink.tag.color
      })) : [];
      
      setEditedData({
        ...donorData,
        tags: formattedTags
      });
    } catch (error) {
      console.error("Error fetching donor details:", error);
      toast({
        title: "Error",
        description: "Failed to load donor details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    setLoadingTags(true);
    try {
      const response = await axios.get("/api/tag", {
        withCredentials: true
      });
      
      const tagsData = response.data.tags.map(tag => ({
        value: tag.id,
        label: tag.name,
        color: tag.color
      }));
      
      setAllTags(tagsData);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to load tags",
        variant: "destructive",
      });
    } finally {
      setLoadingTags(false);
    }
  };

  const handleCreateNewTag = async () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post("/api/tag", {
        name: newTag.name,
        color: newTag.color
      }, {
        withCredentials: true
      });

      const createdTag = {
        value: response.data.tag.id,
        label: response.data.tag.name,
        color: response.data.tag.color,
      };

      setAllTags(prev => [...prev, createdTag]);
      setEditedData(prev => ({
        ...prev,
        tags: [...prev.tags, createdTag],
      }));
      
      setNewTag({ name: "", color: "#6366f1" });
      setNewTagDialog(false);

      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    } catch (error) {
      console.error("Error creating tag:", error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const handleTagsChange = (selectedTags) => {
    setEditedData(prev => ({
      ...prev,
      tags: selectedTags,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // 重置编辑数据到原始状态
    const formattedTags = donor.tags ? donor.tags.map(tagLink => ({
      value: tagLink.tag.id,
      label: tagLink.tag.name,
      color: tagLink.tag.color
    })) : [];
    
    setEditedData({
      ...donor,
      tags: formattedTags
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // 准备要更新的数据
      const updateData = {
        ...editedData,
        total_donation_amount: editedData.total_donation_amount || 0,
        total_pledge: editedData.total_pledge || null,
        largest_gift_amount: editedData.largest_gift_amount || null,
        last_gift_amount: editedData.last_gift_amount || null,
      };

      // 处理标签 - 提取标签 ID
      const tagIds = editedData.tags.map(tag => tag.value);
      updateData.tagIds = tagIds;

      // 移除不需要的字段
      delete updateData.created_at;
      delete updateData.updated_at;
      delete updateData.tags; // 因为我们已经提取了 tagIds
      delete updateData.events;

      console.log('Sending update data:', updateData);

      const response = await axios.put(`/api/donor/${id}`, updateData, {
        withCredentials: true
      });

      if (response.data.success) {
        // 重新获取最新数据
        fetchDonorDetails();
        
        // 切换回查看模式
        setIsEditing(false);
        
        toast({
          title: "Success",
          description: "Donor updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating donor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update donor",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
    console.log(`Field ${field} updated to:`, value); 
  };


  const handleNumberInput = (field, value) => {
    const numberValue = value === '' ? null : parseFloat(value);
    handleInputChange(field, numberValue);
  };


  const renderEditableField = (label, field, type = "text") => {
    return (
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        {type === "number" ? (
          <Input
            type="number"
            value={editedData[field] || ''}
            onChange={(e) => handleNumberInput(field, e.target.value)}
            step="0.01"
          />
        ) : type === "select" ? (
          <Select
            value={editedData[field] || ''}
            onValueChange={(value) => handleInputChange(field, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
            </SelectContent>
          </Select>
        ) : type === "checkbox" ? (
          <Checkbox
            checked={editedData[field] || false}
            onCheckedChange={(checked) => handleInputChange(field, checked)}
          />
        ) : (
          <Input
            value={editedData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            type={type}
          />
        )}
      </div>
    );
  };

  const renderReadOnlyField = (label, value) => {
    return (
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-medium">{value}</p>
      </div>
    );
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/donor/${id}`, {
        withCredentials: true,
      });
      
      toast({
        title: "Success",
        description: "Donor deleted successfully",
      });
      
      navigate("/donors");
    } catch (error) {
      console.error("Error deleting donor:", error);
      toast({
        title: "Error",
        description: "Failed to delete donor",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4 flex justify-center">
        <div className="text-xl">Loading donor details...</div>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="text-xl text-center">Donor not found</div>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate("/donors")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Donors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/donors")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">
            {donor.first_name} {donor.last_name}
          </h1>
          {donor.organization_name && (
            <span className="text-muted-foreground ml-2">
              ({donor.organization_name})
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  {renderEditableField("First Name", "first_name")}
                  {renderEditableField("Last Name", "last_name")}
                  {renderEditableField("Nickname", "nick_name")}
                  {renderEditableField("Organization", "organization_name")}
                  {renderEditableField("PMM", "pmm")}
                </>
              ) : (
                <>
                  {renderReadOnlyField("First Name", donor?.first_name)}
                  {renderReadOnlyField("Last Name", donor?.last_name)}
                  {donor?.nick_name && renderReadOnlyField("Nickname", donor.nick_name)}
                  {donor?.organization_name && renderReadOnlyField("Organization", donor.organization_name)}
                  {renderReadOnlyField("PMM", donor?.pmm)}
                </>
              )}
            </div>

            {(donor.exclude || donor.deceased) && (
              <div className="mt-4 border-t pt-4">
                {donor.exclude && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Mail className="h-4 w-4" />
                    <p>Excluded from communications</p>
                  </div>
                )}
                {donor.deceased && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <p>Deceased</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Address</p>
              <p className="text-lg font-medium">
                {donor.unit_number && `${donor.unit_number} - `}
                {donor.street_address}
              </p>
              <p className="text-lg font-medium">
                {donor.city && donor.city.replace(/_/g, ' ')}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Contact Phone Type</p>
              <p className="text-lg font-medium">{donor.contact_phone_type}</p>
            </div>

            {donor.phone_restrictions && (
              <div>
                <p className="text-sm text-muted-foreground">Phone Restrictions</p>
                <p className="text-lg font-medium">{donor.phone_restrictions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Donation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-lg font-medium text-emerald-600">
                  {formatCurrency(donor.total_donation_amount)}
                </p>
              </div>
              {donor.total_pledge && (
                <div>
                  <p className="text-sm text-muted-foreground">Total Pledge</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(donor.total_pledge)}
                  </p>
                </div>
              )}
              {donor.largest_gift_amount && (
                <div>
                  <p className="text-sm text-muted-foreground">Largest Gift</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(donor.largest_gift_amount)}
                  </p>
                </div>
              )}
              {donor.largest_gift_appeal && (
                <div>
                  <p className="text-sm text-muted-foreground">Largest Gift Appeal</p>
                  <p className="text-lg font-medium">{donor.largest_gift_appeal}</p>
                </div>
              )}
              {donor.last_gift_amount && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Gift</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(donor.last_gift_amount)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">In-Person Events</p>
                <p className="text-lg font-medium">
                  {donor.subscription_events_in_person && 
                   donor.subscription_events_in_person.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Magazine</p>
                <p className="text-lg font-medium">
                  {donor.subscription_events_magazine && 
                   donor.subscription_events_magazine.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Communication Type</p>
                <p className="text-lg font-medium">
                  {donor.communication_preference && 
                   donor.communication_preference.replace('_', ' ')}
                </p>
              </div>
            </div>

            {(donor.email_restrictions || donor.communication_restrictions) && (
              <div className="mt-4 border-t pt-4">
                {donor.email_restrictions && (
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">Email Restrictions</p>
                    <p className="text-md">{donor.email_restrictions}</p>
                  </div>
                )}
                {donor.communication_restrictions && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Communication Restrictions
                    </p>
                    <p className="text-md">{donor.communication_restrictions}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="md:col-span-2 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Select Tags</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewTagDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    New Tag
                  </Button>
                </div>
                <MultiSelect
                  options={allTags}
                  value={editedData.tags}
                  onChange={handleTagsChange}
                  placeholder="Select tags..."
                  isLoading={loadingTags}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {donor?.tags?.map((tagLink) => (
                  <div
                    key={tagLink.tag.id}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: tagLink.tag.color,
                      color: getContrastColor(tagLink.tag.color),
                    }}
                  >
                    {tagLink.tag.name}
                  </div>
                ))}
                {(!donor?.tags || donor.tags.length === 0) && (
                  <p className="text-muted-foreground">No tags</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Tag Dialog */}
      <Dialog open={newTagDialog} onOpenChange={setNewTagDialog}>
        <DialogContent className="sm:max-w-[500px] w-[90vw]">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to categorize donors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-tag-name">Tag Name</Label>
              <Input
                id="new-tag-name"
                value={newTag.name}
                onChange={(e) =>
                  setNewTag((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter tag name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-tag-color">Tag Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-tag-color"
                  type="color"
                  value={newTag.color}
                  onChange={(e) =>
                    setNewTag((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-16 h-10 p-1"
                />
                <div
                  className="w-full h-10 rounded-md border"
                  style={{ backgroundColor: newTag.color }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewTag}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this donor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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