import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Tag, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContrastColor } from "@/utils/helpers";

const DonorForm = ({ 
  formData, 
  setFormData, 
  tags, 
  loadingTags, 
  onTagsChange, 
  onNewTagClick,
  readOnly = false
}) => {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="first_name" className="mb-1">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => !readOnly && setFormData(prev => ({
                  ...prev,
                  first_name: e.target.value
                }))}
                required
                disabled={readOnly}
              />
            </div>
            {/* 其他字段... */}
          </div>
        </CardContent>
      </Card>
      
      {/* 其他卡片... */}
      
      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!readOnly ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Select Tags</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onNewTagClick}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Tag
                </Button>
              </div>
              <MultiSelect
                options={tags}
                value={formData.tags}
                onChange={onTagsChange}
                placeholder="Select tags..."
                isLoading={loadingTags}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <div
                  key={tag.value}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: tag.color,
                    color: getContrastColor(tag.color),
                  }}
                >
                  {tag.label}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorForm; 