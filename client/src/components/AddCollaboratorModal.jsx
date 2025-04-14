import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AddCollaboratorModal({ open, onClose, eventId, onSuccess }) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log(searchQuery);
        const res = await fetch(`/api/user/search?query=${searchQuery}`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        console.log(data);
        const filtered = data.filter(
          (u) => !selectedCollaborators.find((c) => c.id === u.id)
        );
        setSearchResults(filtered);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to search users.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCollaborators]);

  const handleSelectCollaborator = (user) => {
    setSelectedCollaborators((prev) => [...prev, user]);
    setSearchQuery("");
  };

  const handleRemove = (id) => {
    setSelectedCollaborators((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSave = async () => {
    if (selectedCollaborators.length === 0) {
      toast({
        title: "No collaborators selected",
        description: "Please select at least one user.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/event/${eventId}/add-collaborator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userIds: selectedCollaborators.map((u) => u.id),
        }),
      });

      if (!res.ok) throw new Error("Failed to add collaborators");

      toast({
        title: "Success",
        description: "Collaborators added successfully.",
      });

      onSuccess?.();
      onClose();
      setSelectedCollaborators([]);
      setSearchQuery("");
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not add collaborators.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Collaborators</DialogTitle>
          <DialogDescription>
            Search for users to add as collaborators.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Command className="rounded-lg border shadow-sm">
            <CommandInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search by username or email..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : "No users found."}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-72">
                  {searchResults.map((user) => (
                    <CommandItem
  key={user.id}
  value={user.username}
  onSelect={() => handleSelectCollaborator(user)}
  className="flex items-center justify-between"
>
  <div className="flex items-center">
    <Avatar className="h-8 w-8 mr-3">
      {user.avatar ? (
        <AvatarImage src={user.avatar} />
      ) : (
        <AvatarFallback>
          {user.username?.[0]?.toUpperCase() || "?"}
        </AvatarFallback>
      )}
    </Avatar>
    <div>
      <p className="font-medium">{user.username}</p>
      <p className="text-xs text-muted-foreground">{user.email}</p>
    </div>
  </div>

  {/* ✅ Only show check if selected */}
  {selectedCollaborators.some((u) => u.id === user.id) && (
    <Check className="h-4 w-4 text-muted-foreground" />
  )}
</CommandItem>

                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>

          {selectedCollaborators.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Collaborators</p>
              <div className="flex flex-wrap gap-2">
                {selectedCollaborators.map((u) => (
                  <Badge
                    key={u.id}
                    className="flex items-center gap-1 px-3 py-1 text-sm"
                  >
                    {u.username}
                    <button
                      onClick={() => handleRemove(u.id)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setSelectedCollaborators([]);
              setSearchQuery("");
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedCollaborators.length === 0}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
