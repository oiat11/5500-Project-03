// AddDonorsModal.jsx
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";

import DonorSelection from "@/components/DonorSelection";
import CurrentDonorsList from "@/components/CurrentDonorsList";

export default function AddDonorsModal({
  isOpen,
  onClose,
  onAddDonors,
  existingDonors = [],
}) {
  const { toast } = useToast();
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [removedExistingDonors, setRemovedExistingDonors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedDonors([]);
      setRemovedExistingDonors([]);
    }
  }, [isOpen]);

  const removeDonor = (donorId) => {
    setSelectedDonors((prev) => prev.filter((d) => d.id !== donorId));
  };

  const removeExistingDonor = (donorId) => {
    setRemovedExistingDonors((prev) => [...prev, donorId]);
  };

  const handleSubmit = () => {
    const donorsToAdd = selectedDonors;
    const donorsToRemove = removedExistingDonors;

    if (donorsToAdd.length === 0 && donorsToRemove.length === 0) {
      toast({
        title: "No changes made",
        description: "Please add or remove donors before submitting",
        variant: "destructive",
      });
      return;
    }

    onAddDonors(donorsToAdd, donorsToRemove);
    onClose();
  };

  const clearAll = () => {
    setSelectedDonors([]);
    setRemovedExistingDonors([]);
    toast({ title: "Reset", description: "All changes have been cleared." });
  };

  const formattedExistingDonors = existingDonors
    .map((donor) => ({
      ...donor,
      isExisting: true,
    }))
    .filter((donor) => !removedExistingDonors.includes(donor.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden flex flex-col max-h-[90vh]"
        style={{ width: "90vw", maxWidth: "1400px" }}
      >
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">
            Add Donors to Event
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonorSelection
              selectedDonors={selectedDonors}
              onChange={setSelectedDonors}
              excludeDonors={[...selectedDonors, ...formattedExistingDonors]}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">
                  Selected Donors (
                  {selectedDonors.length + formattedExistingDonors.length})
                </h3>
                {(selectedDonors.length > 0 ||
                  removedExistingDonors.length > 0) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                  >
                    Reset Changes
                  </Button>
                )}
              </div>

              <Card>
                <CardContent className="p-3">
                  <CurrentDonorsList
                    donors={[...selectedDonors, ...formattedExistingDonors]}
                    onRemove={(donor) => {
                      const id = typeof donor === "object" ? donor.id : donor;
                      if (existingDonors.find((d) => d.id === id)) {
                        removeExistingDonor(id);
                      } else {
                        removeDonor(id);
                      }
                    }}
                  />

                  {removedExistingDonors.length > 0 && (
                    <div className="mt-4 text-sm text-red-500">
                      {removedExistingDonors.length} donor(s) will be removed
                      from the event
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 pt-2 border-t mt-auto">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              selectedDonors.length === 0 && removedExistingDonors.length === 0
            }
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
