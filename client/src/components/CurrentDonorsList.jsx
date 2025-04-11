import React from "react";
import DonorList from "@/components/DonorList";

export default function CurrentDonorsList({ donors, onRemove }) {
  return (
    <div className="h-full flex flex-col">
      <DonorList
        donors={donors}
        onToggle={(donor) => onRemove(donor.id || donor.value)}
        getActionIcon="remove"
      />
    </div>
  );
}
