import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { format, formatDistanceToNow } from "date-fns";
import { Clock, AlertCircle } from "lucide-react";

export default function EventHistoryPanel({ eventId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/event/${eventId}/history`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch event history");
        }
        
        const data = await response.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error("Error fetching event history:", error);
        toast({
          title: "Error",
          description: "Failed to load event history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchHistory();
    }
  }, [eventId, toast]);

  const getActionDescription = (item) => {
    switch (item.edit_type) {
      case "event_created":
        return `Created event "${item.new_value}"`;
      case "name_updated":
        return `Changed name from "${item.old_value || 'None'}" to "${item.new_value}"`;
      case "description_updated":
        return "Updated event description";
      case "location_updated":
        return `Changed location from "${item.old_value || 'None'}" to "${item.new_value || 'None'}"`;
      case "date_updated":
        return "Updated event date";
      case "status_updated":
        return `Changed status from "${item.old_value || 'None'}" to "${item.new_value}"`;
      case "donor_status_updated":
        return `Changed donor status from "${item.old_value}" to "${item.new_value}"`;
      case "donor_added_bulk":
        return item.new_value;
      case "donor_removed_bulk":
        return item.old_value;
      case "donor_initialized":
        return `Added ${item.new_value}`;
      case "tag_updated":
        return "Updated event tags";
      case "collaborator_added":
        return `Added collaborator`;
      case "collaborator_removed":
        return `Removed collaborator`;
      default:
        return `${item.edit_type.replace(/_/g, " ")}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Event History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No history available</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={item.id || index} className="relative">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-8 w-8">
                        {item.editor?.avatar ? (
                          <AvatarImage src={item.editor.avatar} />
                        ) : (
                          <AvatarFallback>
                            {item.editor?.username?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {index !== history.length - 1 && (
                        <div className="w-0.5 bg-gray-200 grow mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.editor?.username || `User #${item.editor_id}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{getActionDescription(item)}</p>
                        <span className="text-xs text-muted-foreground mt-1">
                          {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index !== history.length - 1 && <div className="h-4"></div>}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}