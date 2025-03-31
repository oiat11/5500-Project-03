import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import axios from 'axios';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';

const DonorFilters = ({ onFilterChange, availableFilters = {} }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    minDonationAmount: '',
    maxDonationAmount: '',
    largestGiftAppeal: '',
    cities: [],
    contactPhoneType: '',
    phoneRestrictions: '',
    emailRestrictions: '',
    communicationRestrictions: '',
    tags: [],
    tagSearch: ''
  });
  const [availableCities, setAvailableCities] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('/api/donor/cities', {
          withCredentials: true
        });
        if (response.data) {
          setAvailableCities(response.data.cities);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    fetchCities();
  }, []);

  // Fetch tags directly from the tag API endpoint
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const response = await axios.get('/api/tag', {
          withCredentials: true
        });
        
        if (response.data && response.data.tags) {
          // Format tags for MultiSelect component
          const formattedTags = response.data.tags.map(tag => ({
            value: tag.name,  // Using tag name as value for filtering
            label: tag.name,
            color: tag.color || '#6366f1'  // Use tag color or default
          }));
          setTagOptions(formattedTags);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Also use available filters if they exist (as a backup)
  useEffect(() => {
    if (availableFilters.tags?.length > 0 && tagOptions.length === 0) {
      setTagOptions(availableFilters.tags.map(tag => ({
        value: tag,
        label: tag,
        color: '#6366f1' // Default color if not provided
      })));
    }
  }, [availableFilters.tags, tagOptions.length]);

  // Handler to clear a specific filter
  const handleClearFilter = (filterName) => {
    if (Array.isArray(filters[filterName])) {
      setFilters(prev => ({ ...prev, [filterName]: [] }));
    } else {
      setFilters(prev => ({ ...prev, [filterName]: '' }));
    }
  };

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handler for select changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle city selection
  const handleCitySelect = (e) => {
    const selectedCity = e.target.value;
    if (selectedCity && !filters.cities.includes(selectedCity)) {
      setFilters(prev => ({
        ...prev,
        cities: [...prev.cities, selectedCity]
      }));
    }
  };

  // Handle city tag removal
  const handleRemoveCity = (city) => {
    setFilters(prev => ({
      ...prev,
      cities: prev.cities.filter(c => c !== city)
    }));
  };

  // Handler for phone type selection
  const handlePhoneTypeSelect = (type) => {
    setFilters(prev => ({ ...prev, contactPhoneType: type }));
  };

  // Handler for tag selection with MultiSelect
  const handleTagsChange = (selectedTags) => {
    setFilters(prev => ({
      ...prev,
      tags: selectedTags
    }));
  };

  // Apply filters when they change
  useEffect(() => {
    // Convert filters to query parameters
    const queryParams = {
      ...filters,
      // Convert arrays to comma-separated strings for the API
      cities: filters.cities.length > 0 ? filters.cities.join(',') : undefined,
      // 将标签作为数组发送，而不是逗号分隔的字符串，以实现OR过滤逻辑
      tags: filters.tags.length > 0 ? filters.tags.map(tag => typeof tag === 'object' ? tag.value : tag) : undefined,
      // Only include non-empty values
      largestGiftAppeal: filters.largestGiftAppeal || undefined,
      contactPhoneType: filters.contactPhoneType || undefined,
      phoneRestrictions: filters.phoneRestrictions || undefined,
      emailRestrictions: filters.emailRestrictions || undefined,
      communicationRestrictions: filters.communicationRestrictions || undefined,
      // Only include donation amounts if they have values
      minDonationAmount: filters.minDonationAmount || undefined,
      maxDonationAmount: filters.maxDonationAmount || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    onFilterChange(queryParams);
  }, [filters, onFilterChange]);

  const phoneTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'Home', label: 'Home' },
    { value: 'Work', label: 'Work' },
    { value: 'Mobile', label: 'Mobile' }
  ];

  const largestGiftAppealOptions = [
    { value: '', label: 'Select an appeal...' },
    { value: 'appeal1', label: 'Appeal 1' },
    { value: 'appeal2', label: 'Appeal 2' },
    { value: 'appeal3', label: 'Appeal 3' }
  ];

  const phoneRestrictionsOptions = [
    { value: '', label: 'Select a restriction...' },
    { value: 'None', label: 'None' },
    { value: 'Do Not Call', label: 'Do Not Call' },
    { value: 'No Mass Communications', label: 'No Mass Communications' },
    { value: 'No Surveys', label: 'No Surveys' },
    { value: 'No Mass Appeals', label: 'No Mass Appeals' }
  ];

  const emailRestrictionsOptions = [
    { value: '', label: 'Select a restriction...' },
    { value: 'None', label: 'None' },
    { value: 'Do Not Email', label: 'Do Not Email' },
    { value: 'No Mass Communications', label: 'No Mass Communications' },
    { value: 'No Surveys', label: 'No Surveys' },
    { value: 'No Mass Appeals', label: 'No Mass Appeals' }
  ];

  const communicationRestrictionsOptions = [
    { value: '', label: 'Select a restriction...' },
    { value: 'None', label: 'None' },
    { value: 'No Surveys', label: 'No Surveys' },
    { value: 'No Mass Appeals', label: 'No Mass Appeals' },
    { value: 'No Mass Communications', label: 'No Mass Communications' }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1"
          >
            {expanded ? (
              <>
                <span>Collapse</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Expand</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-4">
            {/* Basic Filters */}
            <div className="flex flex-col gap-4 mb-4">
              {/* Total Donations Amount Filter */}
              <div>
                <Label htmlFor="minDonationAmount" className="mb-1">Total Donation Amount</Label>
                <div className="flex items-center gap-2">
                  <span>$</span>
                  <Input
                    placeholder="Min"
                    name="minDonationAmount"
                    value={filters.minDonationAmount}
                    onChange={handleInputChange}
                    className="w-24"
                  />
                  <span>-</span>
                  <span>$</span>
                  <Input
                    placeholder="Max"
                    name="maxDonationAmount"
                    value={filters.maxDonationAmount}
                    onChange={handleInputChange}
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleClearFilter('minDonationAmount');
                      handleClearFilter('maxDonationAmount');
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col gap-4 border-t pt-4">
              {/* Largest Gift Appeal Filter */}
              <div>
                <Label htmlFor="largestGiftAppeal" className="mb-1">Largest Gift Appeal</Label>
                <div className="flex gap-2">
                  <select
                    id="largestGiftAppeal"
                    name="largestGiftAppeal"
                    value={filters.largestGiftAppeal}
                    onChange={handleSelectChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {largestGiftAppealOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClearFilter('largestGiftAppeal')}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* City Filter */}
              <div>
                <Label htmlFor="cities" className="mb-1">Cities</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <select
                      id="cities"
                      onChange={handleCitySelect}
                      value=""
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select cities...</option>
                      {availableCities
                        .filter(city => !filters.cities.includes(city))
                        .map(city => (
                          <option key={city} value={city}>
                            {city.replace(/_/g, ' ')}
                          </option>
                        ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearFilter('cities')}
                    >
                      Clear
                    </Button>
                  </div>
                  
                  {/* Display selected cities */}
                  {filters.cities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.cities.map(city => (
                        <span 
                          key={city} 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {city.replace(/_/g, ' ')}
                          <button 
                            type="button"
                            className="ml-1 text-blue-500 hover:text-blue-800 focus:outline-none"
                            onClick={() => handleRemoveCity(city)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Phone Type Filter */}
              <div>
                <Label htmlFor="contactPhoneType" className="mb-1">Contact Phone Type</Label>
                <div className="flex flex-wrap gap-2">
                  {phoneTypeOptions.map(option => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={filters.contactPhoneType === option.value || (option.value === 'all' && !filters.contactPhoneType) ? "default" : "outline"}
                      onClick={() => handlePhoneTypeSelect(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Phone Restrictions Filter */}
              <div>
                <Label htmlFor="phoneRestrictions" className="mb-1">Phone Restrictions</Label>
                <div className="flex gap-2">
                  <select
                    id="phoneRestrictions"
                    name="phoneRestrictions"
                    value={filters.phoneRestrictions}
                    onChange={handleSelectChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {phoneRestrictionsOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClearFilter('phoneRestrictions')}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Email Restrictions Filter */}
              <div>
                <Label htmlFor="emailRestrictions" className="mb-1">Email Restrictions</Label>
                <div className="flex gap-2">
                  <select
                    id="emailRestrictions"
                    name="emailRestrictions"
                    value={filters.emailRestrictions}
                    onChange={handleSelectChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailRestrictionsOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClearFilter('emailRestrictions')}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Donor Tags Filter - Using MultiSelect */}
              <div>
                <Label htmlFor="tags" className="mb-1">Donor Tags</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="w-full">
                      <MultiSelect
                        id="tags"
                        isLoading={loadingTags}
                        options={tagOptions}
                        value={filters.tags}
                        onChange={handleTagsChange}
                        placeholder="Select tags..."
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearFilter('tags')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Communication Restrictions Filter */}
              <div>
                <Label htmlFor="communicationRestrictions" className="mb-1">Communication Restrictions</Label>
                <div className="flex gap-2">
                  <select
                    id="communicationRestrictions"
                    name="communicationRestrictions"
                    value={filters.communicationRestrictions}
                    onChange={handleSelectChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {communicationRestrictionsOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClearFilter('communicationRestrictions')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonorFilters; 