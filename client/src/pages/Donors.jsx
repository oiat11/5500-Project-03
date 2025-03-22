import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useToast } from "@/components/ui/toast";
import { debounce } from 'lodash';

export default function Donors() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Fetch donors with search and pagination
  const fetchDonors = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/donor`, {
        params: {
          page,
          limit: pagination.limit,
          search,
          sortBy: 'updated_at',
          sortOrder: 'desc'
        }
      });
      setDonors(response.data.donors);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching donors:', error);
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
    fetchDonors(1, value);
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
      fetchDonors(newPage, searchTerm);
    }
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
    <div className="container mx-auto px-4 py-6">
      {/* Header with title and button */}
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-2xl font-bold whitespace-nowrap flex-shrink-0">Donors</h1>
        <Button onClick={() => navigate("/donors/create")}>
          Create Donor
        </Button>
      </div>

      {/* Search and filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search donors by name, email, phone, address..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <Button variant="outline" onClick={() => fetchDonors(1, searchTerm)}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donors List */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="text-center py-8">
              Loading donors...
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-8">
              No donors found. Try a different search or create a new donor.
            </div>
          ) : (
            <div className="grid gap-4">
              {donors.map((donor) => (
                <Card 
                  key={donor.id} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/donors/${donor.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-medium">
                          {donor.is_company ? (
                            donor.organization_name
                          ) : (
                            `${donor.first_name || ''} ${donor.last_name || ''}`
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {donor.is_company ? "Company" : "Individual"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">{donor.email || "No email"}</p>
                        <p className="text-sm">{donor.phone_number || "No phone"}</p>
                        <p className="text-sm">
                          {[donor.city, donor.state, donor.country]
                            .filter(Boolean)
                            .join(", ") || "No location"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Total Donations:</span> {donor.total_donation_amount
                            ? `$${parseFloat(donor.total_donation_amount).toLocaleString()}`
                            : "$0"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Last Donation:</span> {donor.last_donation 
                            ? new Date(donor.last_donation.donation_date).toLocaleDateString() 
                            : "Never"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {donor.tags && donor.tags.length > 0 
                            ? donor.tags.slice(0, 3).map(tagRel => (
                                <span 
                                  key={tagRel.tag.id}
                                  className="px-2 py-1 text-xs rounded-full text-white"
                                  style={{ backgroundColor: tagRel.tag.color || '#6366f1' }}
                                >
                                  {tagRel.tag.name}
                                </span>
                              ))
                            : <span className="text-xs text-gray-500">No tags</span>
                          }
                          {donor.tags && donor.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200">
                              +{donor.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="px-4">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}