import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/toast";
import { debounce } from "lodash";
import DonorFilters from "@/components/DonorFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Donors() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableFilters, setAvailableFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const fileInputRef = useRef(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [sorting, setSorting] = useState({
    column: "updated_at",
    direction: "desc",
  });

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await axios.post('/api/donor/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Successfully imported ${response.data.count} donors out of ${response.data.total} rows`,
        });
        
        // If there are any errors, show them
        if (response.data.errors && response.data.errors.length > 0) {
          console.warn('Import warnings:', response.data.errors);
          toast({
            title: "Warning",
            description: "Some donors could not be imported. Check console for details.",
            variant: "warning",
          });
        }

        // Reset search and filters
        setSearchTerm('');
        setActiveFilters({});
        // Refresh donor list
        fetchDonors(1, '', {});
      } else {
        throw new Error(response.data.error || 'Failed to import donors');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || 'Failed to import donors',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filters) => {
      setActiveFilters(filters);
      fetchDonors(1, searchTerm, filters);
    },
    [searchTerm]
  );

  const fetchDonors = async (page = 1, search = "", filters = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search,
        sortBy: sorting.column,
        sortOrder: sorting.direction,
      };
      if (filters.minAge) params.minAge = filters.minAge;
      if (filters.maxAge) params.maxAge = filters.maxAge;
      if (filters.minDonationAmount)
        params.minDonationAmount = filters.minDonationAmount;
      if (filters.maxDonationAmount)
        params.maxDonationAmount = filters.maxDonationAmount;
      if (filters.minDonationCount)
        params.minDonationCount = filters.minDonationCount;
      if (filters.maxDonationCount)
        params.maxDonationCount = filters.maxDonationCount;
      if (filters.gender && filters.gender !== "all")
        params.gender = filters.gender;
      if (filters.isCompany !== undefined) params.isCompany = filters.isCompany;

      // Handle array parameters
      if (filters.locations && filters.locations.length > 0) {
        params.location = filters.locations;
      }

      // Handle interest domains with level filtering
      if (filters.interestDomains && filters.interestDomains.length > 0) {
        params.interestDomains = filters.interestDomains.map(
          (domain) => domain.name
        );

        // Add interest level parameters for each domain
        filters.interestDomains.forEach((domain, index) => {
          params[`interestDomainLevel_${index}_name`] = domain.name;
          params[`interestDomainLevel_${index}_min`] = domain.minLevel;
          params[`interestDomainLevel_${index}_max`] = domain.maxLevel;
        });

        params.interestDomainsCount = filters.interestDomains.length;
      }

      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags;
      }

      const response = await axios.get(`/api/donor`, { params });
      setDonors(response.data.donors);
      setPagination(response.data.pagination);

      // Store available filters for the filter component
      if (response.data.filters) {
        setAvailableFilters(response.data.filters);
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch donors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  const debouncedSearch = debounce((value) => {
    fetchDonors(1, value, activeFilters);
  }, 500);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchDonors(newPage, searchTerm, activeFilters);
    }
  };

  // Handle row selection
  const handleSelectRow = (donorId) => {
    setSelectedDonors((prev) => {
      if (prev.includes(donorId)) {
        return prev.filter((id) => id !== donorId);
      } else {
        return [...prev, donorId];
      }
    });
  };

  // Handle select all rows
  const handleSelectAll = () => {
    if (selectedDonors.length === donors.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(donors.map((donor) => donor.id));
    }
  };

  // Handle sort column
  const handleSort = (column) => {
    setSorting((prev) => {
      const newDirection =
        prev.column === column && prev.direction === "asc" ? "desc" : "asc";
      return {
        column,
        direction: newDirection,
      };
    });
    // Refetch with new sorting
    fetchDonors(pagination.page, searchTerm, activeFilters);
  };

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (sorting.column !== column) return null;
    return sorting.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selectedDonors.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedDonors.length} donor(s)?`
      )
    ) {
      try {
        setLoading(true);
        await Promise.all(
          selectedDonors.map((id) => axios.delete(`/api/donor/${id}`))
        );

        toast({
          title: "Success",
          description: `${selectedDonors.length} donor(s) deleted successfully.`,
        });

        // Clear selection and refresh list
        setSelectedDonors([]);
        fetchDonors(pagination.page, searchTerm, activeFilters);
      } catch (error) {
        console.error("Error deleting donors:", error);
        toast({
          title: "Error",
          description: "Failed to delete donors. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkExport = () => {
    if (selectedDonors.length === 0) return;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    csvContent +=
      "ID,Name,Type,Email,Phone,City,State,Country,Total Donations,Tags\n";

    // Add rows for selected donors
    selectedDonors.forEach((id) => {
      const donor = donors.find((d) => d.id === id);
      if (donor) {
        const name = donor.is_company
          ? donor.organization_name
          : `${donor.first_name || ""} ${donor.last_name || ""}`;
        const type = donor.is_company ? "Company" : "Individual";
        const tags = donor.tags
          ? donor.tags.map((t) => t.tag.name).join("|")
          : "";

        csvContent += `${donor.id},"${name}",${type},${donor.email || ""},${
          donor.phone_number || ""
        },`;
        csvContent += `${donor.city || ""},${donor.state || ""},${
          donor.country || ""
        },`;
        csvContent += `${donor.total_donation_amount || 0},"${tags}"\n`;
      }
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_donors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `${selectedDonors.length} donor(s) exported to CSV.`,
    });
  };

  // Initial load
  useEffect(() => {
    fetchDonors();
    // Clean up debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-2xl font-bold whitespace-nowrap flex-shrink-0">Donors</h1>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Import Donors with CSV</Button>
          <Button onClick={() => navigate("/donors/create")}>Add Donor Manually</Button>
        </div>
      </div>

      <Card className="mb-6 w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search donors..." value={searchTerm} onChange={handleSearchChange} className="w-full" />
            </div>
            <Button variant="outline" onClick={() => fetchDonors(1, searchTerm, activeFilters)}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <DonorFilters onFilterChange={handleFilterChange} availableFilters={availableFilters} />

      <div className="bg-white rounded-md shadow overflow-hidden w-full min-h-[400px]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Results Section</h2>
          {selectedDonors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedDonors.length} donor(s) selected</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">Actions <ChevronDown className="ml-1 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkExport()}>Export Selected</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkDelete()} className="text-red-600">Delete Selected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox checked={selectedDonors.length === donors.length && donors.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                  <TableHead onClick={() => handleSort('last_name')} className="cursor-pointer"><div className="flex items-center">Donor Name{renderSortIndicator('last_name')}</div></TableHead>
                  <TableHead onClick={() => handleSort('is_company')} className="cursor-pointer"><div className="flex items-center">Type{renderSortIndicator('is_company')}</div></TableHead>
                  <TableHead onClick={() => handleSort('age')} className="cursor-pointer"><div className="flex items-center">Age{renderSortIndicator('age')}</div></TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead onClick={() => handleSort('total_donation_amount')} className="cursor-pointer"><div className="flex items-center">Total Donations{renderSortIndicator('total_donation_amount')}</div></TableHead>
                  <TableHead onClick={() => handleSort('last_donation_date')} className="cursor-pointer"><div className="flex items-center">Last Donation{renderSortIndicator('last_donation_date')}</div></TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Loading donors...</TableCell></TableRow>
                ) : donors.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">No donors found.</TableCell></TableRow>
                ) : (
                  donors.map((donor) => (
                    <TableRow key={donor.id} className="cursor-pointer hover:bg-slate-50" onClick={(e) => {
                      if (e.target.type !== 'checkbox' && !e.target.closest('.checkbox-wrapper')) navigate(`/donors/${donor.id}`);
                    }}>
                      <TableCell className="checkbox-wrapper"><Checkbox checked={selectedDonors.includes(donor.id)} onCheckedChange={() => handleSelectRow(donor.id)} onClick={(e) => e.stopPropagation()} /></TableCell>
                      <TableCell className="font-medium">{donor.is_company ? donor.organization_name : `${donor.first_name || ''} ${donor.last_name || ''}`}</TableCell>
                      <TableCell>{donor.is_company ? "Company" : "Individual"}</TableCell>
                      <TableCell>{donor.age || 'N/A'}</TableCell>
                      <TableCell><div className="text-sm">{donor.email || "No email"}</div><div className="text-sm">{donor.phone_number || "No phone"}</div></TableCell>
                      <TableCell>{[donor.city, donor.state, donor.country].filter(Boolean).join(", ") || "No location"}</TableCell>
                      <TableCell>{donor.total_donation_amount ? `$${parseFloat(donor.total_donation_amount).toLocaleString()}` : "$0"}</TableCell>
                      <TableCell>{donor.last_donation ? new Date(donor.last_donation.donation_date).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{donor.tags?.length ? donor.tags.slice(0, 3).map(tagRel => (<span key={tagRel.tag.id} className="px-2 py-1 text-xs rounded-full text-white" style={{ backgroundColor: tagRel.tag.color || '#6366f1' }}>{tagRel.tag.name}</span>)) : <span className="text-xs text-gray-500">No tags</span>}{donor.tags?.length > 3 && <span className="px-2 py-1 text-xs rounded-full bg-gray-200">+{donor.tags.length - 3}</span>}</div></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-4 py-2 border-t flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>Previous</Button>
              <span className="px-4">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
