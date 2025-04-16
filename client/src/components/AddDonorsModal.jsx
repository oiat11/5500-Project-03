// AddDonorsModal.jsx (with capacity info and warnings like CreateEvent)
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DonorSelection from "@/components/DonorSelection";
import CurrentDonorsList from "@/components/CurrentDonorsList";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function AddDonorsModal({
  isOpen,
  onClose,
  onAddDonors,
  existingDonors = [],
  capacity = null,
}) {
  const { toast } = useToast();
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [removedExistingDonors, setRemovedExistingDonors] = useState([]);
  const [showOverCapacityDialog, setShowOverCapacityDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

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
    const totalSelected = selectedDonors.length + existingDonors.length - removedExistingDonors.length;
    if (capacity && totalSelected > capacity) {
      setShowOverCapacityDialog(true);
      setPendingSubmit(true);
      return;
    }
    submitChanges();
  };

  const submitChanges = () => {
    onAddDonors(selectedDonors, removedExistingDonors);
    onClose();
    setPendingSubmit(false);
    setShowOverCapacityDialog(false);
  };

  const clearAll = () => {
    setSelectedDonors([]);
    setRemovedExistingDonors([]);
    toast({ title: "Reset", description: "All changes have been cleared." });
  };

  const formattedExistingDonors = existingDonors
    .map((donor) => ({ ...donor, isExisting: true }))
    .filter((donor) => !removedExistingDonors.includes(donor.id));

  const totalSelected = selectedDonors.length + formattedExistingDonors.length;

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
            <div className="space-y-2">
              {capacity && totalSelected > capacity && (
                <div className="p-2 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300 text-sm">
                  ⚠️ You have selected <strong>{totalSelected}</strong> donors, which exceeds the event capacity of <strong>{capacity}</strong>.
                </div>
              )}
              {capacity && (
                <div className="text-sm text-muted-foreground">
                  Selected <strong>{totalSelected}</strong> out of <strong>{capacity}</strong> donors
                </div>
              )}

              <DonorSelection
                selectedDonors={selectedDonors}
                onChange={setSelectedDonors}
                excludeDonors={[...selectedDonors, ...formattedExistingDonors]}
              />
            </div>

            <div>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Selected Donors ({totalSelected})
                    </CardTitle>
                    {(selectedDonors.length > 0 || removedExistingDonors.length > 0) && (
                      <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                        Reset Changes
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
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
                      {removedExistingDonors.length} donor(s) will be removed from the event
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
            disabled={selectedDonors.length === 0 && removedExistingDonors.length === 0}
          >
            Save Changes
          </Button>
        </DialogFooter>

        <ConfirmDialog
          open={showOverCapacityDialog}
          onCancel={() => setShowOverCapacityDialog(false)}
          onConfirm={submitChanges}
          title="Exceeds Capacity"
          description={`You have selected ${totalSelected} donors, which exceeds the event capacity of ${capacity}. Are you sure you want to continue?`}
          confirmLabel="Continue & Save"
          cancelLabel="Cancel"
        />
      </DialogContent>
    </Dialog>
  );
}
