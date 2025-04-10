// CurrentDonorsList.jsx
import React from "react";
import { Card } from "@/components/ui/card";
import DonorList from "@/components/DonorList";

export default function CurrentDonorsList({ donors, onRemove }) {
  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 border border-muted">
        <DonorList
          donors={donors}
          onToggle={(donor) => onRemove(donor.id || donor.value)}
          getActionIcon="remove"
        />
      </Card>
    </div>
  );
}
