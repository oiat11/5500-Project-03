import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

export default function DonorList({ donors, onToggle, getActionIcon = "add" }) {
  return (
    <ScrollArea className="h-[650px] border rounded-md">
      <div className="p-2 space-y-1">
        {donors.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center">
            No donors to display.
          </div>
        ) : (
          donors.map((donor) => (
            <div
              key={donor.id || donor.value}
              className="flex justify-between items-center p-2 rounded-md hover:bg-muted"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {`${donor.first_name} ${donor.last_name}`}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  {donor.city && <span className="mr-2">{donor.city.replace(/_/g, ' ')}</span>}
                  {donor.total_donation_amount > 0 && (
                    <span>Total Donation: ${donor.total_donation_amount.toLocaleString()}</span>
                  )}
                </div>
                {donor.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {donor.tags.map((tagItem, index) => {
                      const tag = tagItem.tag || tagItem;
                      const tagId = tag.id || tagItem.tag_id || index;
                      const tagName = tag.name || '';
                      const tagColor = tag.color || '#6366f1';

                      return (
                        <Badge
                          key={`${donor.id || donor.value}-${tagId}`}
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                          style={{
                            backgroundColor: `${tagColor}20`,
                            borderColor: tagColor,
                            color: tagColor,
                          }}
                        >
                          {tagName}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onToggle(donor)}
                className="transition-colors hover:bg-primary/20"
              >
                {getActionIcon === "remove" ? (
                  <UserMinus className="h-4 w-4 text-red-600" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
