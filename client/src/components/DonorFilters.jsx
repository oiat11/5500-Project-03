import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

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
    isCompany: undefined,
    tags: [],
    tagSearch: ''
  });

  // Handler to clear a specific filter
  const handleClearFilter = (filterName) => {
    if (Array.isArray(filters[filterName])) {
      setFilters(prev => ({ ...prev, [filterName]: [] }));
    } else {
      setFilters(prev => ({ ...prev, [filterName]: '' }));
    }
  };

  // Handler to clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      minDonationAmount: '',
      maxDonationAmount: '',
      largestGiftAppeal: '',
      cities: [],
      contactPhoneType: '',
      phoneRestrictions: '',
      emailRestrictions: '',
      communicationRestrictions: '',
      isCompany: undefined,
      tags: [],
      tagSearch: ''
    });
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

  // Handler for city selection
  const handleCitySelect = (e) => {
    const selectedOption = e.target.value;
    
    if (selectedOption === "") {
      return;
    } else if (!filters.cities.includes(selectedOption)) {
      setFilters(prev => ({ 
        ...prev, 
        cities: [...prev.cities, selectedOption] 
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

  // Handler for tag search
  const handleTagSearch = async () => {
    if (filters.tagSearch.trim()) {
      try {
        const response = await axios.get(`/api/tag/search?query=${filters.tagSearch}`);
        if (response.data && response.data.tags) {
          // Add the tag to the filters
          const newTag = response.data.tags[0]?.name || filters.tagSearch;
          if (!filters.tags.includes(newTag)) {
            setFilters(prev => ({
              ...prev,
              tags: [...prev.tags, newTag],
              tagSearch: ''
            }));
          }
        }
      } catch (error) {
        console.error("Error searching for tag:", error);
        // Add the search term as a tag anyway
        if (!filters.tags.includes(filters.tagSearch)) {
          setFilters(prev => ({
            ...prev,
            tags: [...prev.tags, filters.tagSearch],
            tagSearch: ''
          }));
        }
      }
    }
  };

  // Handler for tag removal
  const handleRemoveTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
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
    { value: 'Do Not Call', label: 'Do Not Call' },
    { value: 'No Mass Communications', label: 'No Mass Communications' },
    { value: 'No Surveys', label: 'No Surveys' },
    { value: 'No Mass Appeals', label: 'No Mass Appeals' }
  ];

  const emailRestrictionsOptions = [
    { value: '', label: 'Select a restriction...' },
    { value: 'Do Not Email', label: 'Do Not Email' },
    { value: 'No Mass Communications', label: 'No Mass Communications' },
    { value: 'No Surveys', label: 'No Surveys' },
    { value: 'No Mass Appeals', label: 'No Mass Appeals' }
  ];

  const communicationRestrictionsOptions = [
    { value: '', label: 'Select a restriction...' },
    { value: 'No Surveys', label: 'No Surveys' },
    { value: 'No Mass Appeals', label: 'No Mass Appeals' },
    { value: 'No Mass Communications', label: 'No Mass Communications' }
  ];

  // BC province regions (cities and regions)
  const bcRegions = [
    "Vancouver",
    "Victoria",
    "Kelowna",
    "Abbotsford",
    "Nanaimo",
    "Kamloops",
    "Chilliwack",
    "Prince George",
    "Vernon",
    "Courtenay",
    "Campbell River",
    "Penticton",
    "Duncan",
    "Parksville",
    "Port Alberni",
    "Squamish",
    "Fort St. John",
    "Powell River",
    "Terrace",
    "Quesnel",
    "Williams Lake",
    "Dawson Creek",
    "Salmon Arm",
    "Nelson",
    "Cranbrook",
    "Outside BC"
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleClearAllFilters}
            >
              Clear All
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        {/* Basic Filters (always visible) */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Total Donations Amount Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Total Donation Amount</label>
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

        {/* Advanced Filters (expandable) */}
        {expanded && (
          <div className="flex flex-col gap-4 border-t pt-4">
            {/* Largest Gift Appeal Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Largest Gift Appeal</label>
              <div className="flex gap-2">
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  name="largestGiftAppeal"
                  value={filters.largestGiftAppeal}
                  onChange={handleSelectChange}
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
              <label className="block text-sm font-medium mb-2">City</label>
              <div className="flex flex-col gap-2">
                {/* Dropdown for selecting city */}
                <div className="flex gap-2">
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={handleCitySelect}
                    value=""
                  >
                    <option value="">Select a city...</option>
                    <optgroup label="BC Regions">
                      {bcRegions.filter(region => region !== "Outside BC").map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Outside BC">
                      <option value="Outside BC">Outside BC</option>
                    </optgroup>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClearFilter('cities')}
                  >
                    Clear
                  </Button>
                </div>

                {/* Display selected cities as tags */}
                {filters.cities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.cities.map(city => (
                      <span 
                        key={city} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {city}
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
              <label className="block text-sm font-medium mb-2">Contact Phone Type</label>
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
              <label className="block text-sm font-medium mb-2">Phone Restrictions</label>
              <div className="flex gap-2">
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  name="phoneRestrictions"
                  value={filters.phoneRestrictions}
                  onChange={handleSelectChange}
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
              <label className="block text-sm font-medium mb-2">Email Restrictions</label>
              <div className="flex gap-2">
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  name="emailRestrictions"
                  value={filters.emailRestrictions}
                  onChange={handleSelectChange}
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
            {/* Donor Tags Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Donor Tags</label>
              <div className="flex flex-col gap-2">
                {/* Tags search input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for tags..."
                    name="tagSearch"
                    value={filters.tagSearch}
                    onChange={handleInputChange}
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagSearch();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTagSearch}
                  >
                    Search
                  </Button>
                </div>
                
                {/* Display selected tags */}
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button 
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-800 focus:outline-none"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Communication Restrictions Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Communication Restrictions</label>
              <div className="flex gap-2">
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  name="communicationRestrictions"
                  value={filters.communicationRestrictions}
                  onChange={handleSelectChange}
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
        )}
      </CardContent>
    </Card>
  );
};

export default DonorFilters; 