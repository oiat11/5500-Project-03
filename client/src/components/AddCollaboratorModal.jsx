import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSelector } from "react-redux";

export default function AddCollaboratorModal({
  open,
  onClose,
  eventId,
  onSuccess,
}) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [existingCollaborators, setExistingCollaborators] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);
  const [removedUsers, setRemovedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = useSelector((state) => state.auth.currentUser?.id);
 
  console.log("currentUserId", currentUserId);

  useEffect(() => {
    if (!open) return;
    const fetchExisting = async () => {
      try {
        const res = await fetch(`/api/event/${eventId}/collaborators`);
        if (!res.ok) throw new Error("Failed to fetch collaborators");
        const data = await res.json();
        setExistingCollaborators(data.collaborators);
        setAddedUsers([]);
        setRemovedUsers([]);
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not load collaborators.",
          variant: "destructive",
        });
      }
    };
    fetchExisting();
  }, [open, eventId]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/user/search?query=${searchQuery}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const filtered = data.filter(
          (u) =>
            u.id !== currentUserId && // user should not be able to add themselves
            !existingCollaborators.find((c) => c.id === u.id) &&
            !addedUsers.find((c) => c.id === u.id)
        );
        setSearchResults(filtered);
        
      } catch {
        toast({
          title: "Error",
          description: "Failed to search users.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    const delay = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, addedUsers, existingCollaborators]);

  const handleAdd = (user) => {
    setAddedUsers((prev) => [...prev, user]);
    setSearchQuery("");
  };

  const handleCancel = () => {
    onClose();
    setSearchQuery("");
    setAddedUsers([]);
    setRemovedUsers([]);
  };

  const handleSave = async () => {
    if (addedUsers.length === 0 && removedUsers.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/event/${eventId}/update-collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addIds: addedUsers.map((u) => u.id),
          removeIds: removedUsers.map((u) => u.id),
        }),
      });
      if (!res.ok) throw new Error("Update failed");

      toast({
        title: "Success",
        description: "Collaborators updated.",
      });

      onSuccess?.();
      handleCancel();
    } catch {
      toast({
        title: "Error",
        description: "Could not update collaborators.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (user) => {
    if (addedUsers.find((u) => u.id === user.id)) {
      setAddedUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      setRemovedUsers((prev) => [...prev, user]);
    }
  };

  const handleUndoRemove = (id) => {
    setRemovedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
          <DialogDescription>
            Add or remove collaborators. Changes are saved when you click "Save".
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Command className="rounded-lg border shadow-sm">
            <CommandInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search users..."
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
                      onSelect={() => handleAdd(user)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} />
                          ) : (
                            <AvatarFallback>{user.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>

          <div className="space-y-2">
            <p className="text-sm font-medium">Collaborators</p>
            <div className="flex flex-col gap-2">
              {/* Existing */}
              {existingCollaborators.map((u) => {
                const isRemoved = removedUsers.find((r) => r.id === u.id);
                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      isRemoved ? "bg-red-100 opacity-60" : "bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7">
                        {u.avatar ? (
                          <AvatarImage src={u.avatar} />
                        ) : (
                          <AvatarFallback>{u.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-sm">
                        <div className="font-medium">
                          {u.username}
                          {u.id === currentUserId && " (you)"}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                    {u.id !== currentUserId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          isRemoved ? handleUndoRemove(u.id) : handleRemove(u)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}

              {/* Newly added */}
              {addedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      {u.avatar ? (
                        <AvatarImage src={u.avatar} />
                      ) : (
                        <AvatarFallback>{u.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{u.username}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemove(u)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isLoading ||
              (addedUsers.length === 0 && removedUsers.length === 0)
            }
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
