import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus } from "lucide-react";

export default function DonorSelection({ donors, selectedDonors, onToggle }) {
  return (
    <ScrollArea className="h-[300px] border rounded-md">
      <div className="p-2 space-y-1">
        {donors.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center">No donors to show.</div>
        ) : (
          donors.map((donor) => {
            const isSelected = selectedDonors.some(d => d.id === donor.id);
            return (
              <div
                key={donor.id}
                className={`flex justify-between items-center p-2 rounded-md ${
                  isSelected ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {donor.organization_name || `${donor.first_name} ${donor.last_name}`}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {donor.city && <span className="mr-2">{donor.city}</span>}
                    {donor.total_donation_amount > 0 && (
                      <span>${donor.total_donation_amount.toLocaleString()}</span>
                    )}
                  </div>
                  {donor.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {donor.tags.map(tag => (
                        <Badge
                          key={`${donor.id}-${tag.id || tag.name}`}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggle(donor)}
                >
                  {isSelected ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
