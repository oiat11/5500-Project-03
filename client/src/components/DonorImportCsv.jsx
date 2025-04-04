import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/components/ui/toast";
import { FileText } from "lucide-react";

export default function DonorImportCsv({ onSuccess }) {
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post("/api/donor/import/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.status === 200) {
        const { createdCount, updatedCount, errors } = response.data;

        toast({
          title: "Import Successful",
          description: `Created: ${createdCount}, Updated: ${updatedCount}.`,
        });

        if (errors?.length) {
          console.warn("Import warnings:", errors);
          toast({
            title: "Warning",
            description: "Some donors could not be imported. Check console for details.",
            variant: "warning",
          });
        }

        onSuccess();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to import donors",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <FileText className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Import Donor List CSV"}
      </Button>
    </>
  );
}
