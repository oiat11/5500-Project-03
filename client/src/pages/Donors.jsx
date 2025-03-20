import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Donors() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4">
      {/* Header with title and button */}
      <div className="flex items-center justify-between w-full mb-4">
        <h1 className="text-2xl font-bold whitespace-nowrap flex-shrink-0">Donors</h1>
        <Button onClick={() => navigate("/donors/create")}>
          Create Donor
        </Button>
      </div>

      {/* Content */}
      <p>Manage your donors here.</p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio, voluptas officiis quo dolorum
        officia reiciendis soluta et, sint veniam molestias exercitationem ducimus numquam rerum
        consequatur voluptates est ullam eos mollitia?
      </p>
    </div>
  );
}