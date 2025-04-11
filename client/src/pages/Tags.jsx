import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Pencil, Plus, Search } from "lucide-react";

export default function Tags() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
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

  // 获取所有标签
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tag');
      if (response.data.tags) {
        setTags(response.data.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error",
        description: "Failed to load tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 过滤标签
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理颜色选择
  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  // 打开创建标签对话框
  const openCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6366f1'
    });
    setIsCreateDialogOpen(true);
  };

  // 创建新标签
  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post('/api/tag', formData);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Tag created successfully"
        });
        fetchTags();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  // 判断文本颜色是否应该是黑色还是白色（根据背景色）
  function getContrastColor(hexColor) {
    if (!hexColor || hexColor === '#' || hexColor === '') return '#000000';
    
    if (hexColor.length === 4) {
      hexColor = '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
    }
    
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    return yiq >= 128 ? '#000000' : '#ffffff';
  }

  // 处理编辑标签
  const handleEditTag = (tagId) => {
    navigate(`/tags/${tagId}`);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-left">Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading tags...
                </TableCell>
              </TableRow>
            ) : filteredTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {searchTerm ? "No tags found matching your search." : "No tags found. Create your first tag to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag) => (
                <TableRow 
                  key={tag.id}
                  className="even:bg-white odd:bg-gray-50 hover:bg-slate-100"
                >
                  <TableCell>
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: tag.color || '#6366f1' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs mr-2 text-white"
                        style={{ 
                          backgroundColor: tag.color || '#6366f1',
                        }}
                      >
                        {tag.name}
                      </span>
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left pl-4">
                    {tag.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTag(tag.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 创建标签对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to categorize donors and events.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter tag name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter tag description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-24 h-10 p-1"
                />
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 