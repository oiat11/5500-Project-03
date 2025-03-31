import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserMinus } from "lucide-react";

export default function CurrentDonorsList({ donors, onStatusChange, onRemove }) {
  return (
    <ScrollArea className="h-[300px]">
      {donors.length > 0 ? (
        <div className="space-y-1">
          {donors.map((donor) => (
            <div
              key={donor.value}
              className="flex justify-between items-center p-3 rounded-md hover:bg-muted"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{donor.label}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  {donor.city && <span className="mr-2">{donor.city}</span>}
                  {donor.totalDonation > 0 && (
                    <span>${donor.totalDonation.toLocaleString()}</span>
                  )}
                </div>
                {donor.tags && donor.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {donor.tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : undefined,
                          borderColor: tag.color,
                          color: tag.color
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={donor.status}
                  onValueChange={(value) => onStatusChange(donor.value, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(donor)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full text-muted-foreground">
          No donors added yet
        </div>
      )}
    </ScrollArea>
  );
} 