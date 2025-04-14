import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  TagIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card
      key={event.id}
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* 日期 */}
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {event.date ? format(new Date(event.date), "PPP") : "No date set"}
        </div>

        {/* 地址 */}
        {event.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinIcon className="mr-2 h-4 w-4" />
            {event.location}
          </div>
        )}

        {/* 描述 */}
        {event.description && (
          <p className="text-sm line-clamp-2">{event.description}</p>
        )}

        {/* 标签 */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex items-start gap-1">
            <TagIcon className="h-4 w-4 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : undefined,
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 创建人 & Donor 数 */}
        <div className="flex justify-between items-center mt-4 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              {event.createdBy?.avatar ? (
                <AvatarImage src={event.createdBy.avatar} />
              ) : (
                <AvatarFallback>
                  {event.createdBy?.username?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <span>{event.createdBy?.username || `User #${event.created_by}`}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <UsersIcon className="mr-1 h-4 w-4" />
              {event.donors?.length || 0} donors
            </div>
            {event.status && (
              <Badge
                variant="outline"
                className={`
                  ${event.status === "draft" ? "bg-gray-100 text-gray-800" : ""}
                  ${event.status === "published" ? "bg-green-100 text-green-800" : ""}
                  ${event.status === "archived" ? "bg-amber-100 text-amber-800" : ""}
                `}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
