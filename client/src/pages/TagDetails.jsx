import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Trash2, Save, X, Tag as TagIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function TagDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    description: "",
    color: "#6366f1"
  });
  
  // 预定义颜色选项
  const colorOptions = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#ef4444', label: 'Red' },
    { value: '#f97316', label: 'Orange' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#22c55e', label: 'Green' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#3b82f6', label: 'Blue' }
  ];

  // 获取标签详情
  useEffect(() => {
    let isMounted = true; // 防止组件卸载后仍然设置状态
    
    const fetchTagDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/tag");
        
        // 如果组件已经卸载，不继续执行
        if (!isMounted) return;
        
        const tagData = response.data.tags.find(t => t.id === id);
        
        if (tagData) {
          setTag(tagData);
          setEditedData({
            name: tagData.name || "",
            description: tagData.description || "",
            color: tagData.color || "#6366f1"
          });
        } else {
          // 如果找不到标签，显示错误并返回到列表页
          toast({
            title: "Error",
            description: "Tag not found",
            variant: "destructive",
          });
          navigate("/tags");
        }
      } catch (error) {
        // 如果组件已经卸载，不继续执行
        if (!isMounted) return;
        
        console.error("Error fetching tag details:", error);
        toast({
          title: "Error",
          description: "Failed to load tag details",
          variant: "destructive",
        });
        navigate("/tags");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTagDetails();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, [id, navigate, toast]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理颜色选择
  const handleColorSelect = (color) => {
    setEditedData(prev => ({
      ...prev,
      color
    }));
  };

  // 进入编辑模式
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditedData({
      name: tag.name || "",
      description: tag.description || "",
      color: tag.color || "#6366f1"
    });
    setIsEditing(false);
  };

  // 保存标签
  const handleSave = async () => {
    if (!editedData.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.patch(`/api/tag/${id}`, editedData);
      
      if (response.data.success) {
        setTag(response.data.tag);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Tag updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update tag",
        variant: "destructive",
      });
    }
  };

  // 删除标签
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/tag/${id}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Tag deleted successfully",
        });
        navigate("/tags");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tag",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog(false);
    }
  };

  // 返回标签列表
  const handleBack = () => {
    navigate("/tags");
  };

  // 判断文本颜色是否应该是黑色还是白色（根据背景色）
  function getContrastColor(hexColor) {
    if (!hexColor || hexColor === '#' || hexColor === '') return '#000000';
    
    // 如果颜色是 #fff 这种简写形式，转换为完整形式
    if (hexColor.length === 4) {
      hexColor = '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
    }
    
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // 计算亮度（使用YIQ公式）
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    return yiq >= 128 ? '#000000' : '#ffffff';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Tag Not Found</h1>
        <p>The tag you are looking for does not exist or has been deleted.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tags
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 py-8">
      {/* Actions Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" /> 
              Tag Details
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-6">
              {/* Tag */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full" 
                    style={{ backgroundColor: editedData.color }}
                  />
                  <span className="text-sm font-medium text-gray-500">
                    Tag Preview: 
                  </span>
                  <div 
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ 
                      backgroundColor: editedData.color,
                    }}
                  >
                    {editedData.name || "Tag Name"}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={editedData.color}
                    onChange={handleInputChange}
                    className="w-24 h-10 p-1"
                  />
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full ${editedData.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => handleColorSelect(color.value)}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={editedData.name}
                  onChange={handleInputChange}
                  placeholder="Enter tag name"
                />
              </div>
              
              <Separator />
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={editedData.description}
                  onChange={handleInputChange}
                  placeholder="Enter tag description"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tag */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm font-medium text-gray-500">
                    Tag Preview: 
                  </span>
                  <div 
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ 
                      backgroundColor: tag.color,
                    }}
                  >
                    {tag.name}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-full" 
                    style={{ backgroundColor: tag.color || '#6366f1' }}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Name */}
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="px-3 py-2 rounded-md border bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: tag.color || '#6366f1' }}
                    />
                    <span>{tag.name}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <div className="px-3 py-2 rounded-md border bg-gray-50 min-h-[60px]">
                  {tag.description || "No description"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tag? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 