import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

const DonorFilters = ({ onFilterChange, availableFilters = {} }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    minDonationAmount: '',
    maxDonationAmount: '',
    minDonationCount: '',
    maxDonationCount: '',
    gender: '',
    locations: [],
    interestDomains: [],
    donorType: '',
    tags: [],
    isCompany: undefined,
    rangeFilters: []
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
      minAge: '',
      maxAge: '',
      minDonationAmount: '',
      maxDonationAmount: '',
      minDonationCount: '',
      maxDonationCount: '',
      gender: '',
      locations: [],
      interestDomains: [],
      donorType: '',
      tags: [],
      isCompany: undefined,
      rangeFilters: []
    });
  };

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handler for toggling array filters (tags, locations, etc)
  const handleToggleArrayFilter = (filterName, value) => {
    setFilters(prev => {
      const currentValues = [...prev[filterName]];
      const index = currentValues.indexOf(value);
      
      if (index === -1) {
        // Add the value if not present
        return {
          ...prev,
          [filterName]: [...currentValues, value]
        };
      } else {
        // Remove the value if already present
        currentValues.splice(index, 1);
        return {
          ...prev,
          [filterName]: currentValues
        };
      }
    });
  };

  // Handler for location selection
  const handleLocationSelect = (e) => {
    const selectedOption = e.target.value;
    
    if (selectedOption === "") {
      setFilters(prev => ({ ...prev, locations: [] }));
    } else if (!filters.locations.includes(selectedOption)) {
      setFilters(prev => ({ 
        ...prev, 
        locations: [...prev.locations, selectedOption] 
      }));
    }
  };

  // Handle location tag removal
  const handleRemoveLocation = (location) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc !== location)
    }));
  };

  // Handler for interest domain selection
  const handleInterestDomainSelect = (e) => {
    const selectedOption = e.target.value;
    
    if (selectedOption === "") {
      return;
    } else if (!filters.interestDomains.some(d => d.name === selectedOption)) {
      setFilters(prev => ({ 
        ...prev, 
        interestDomains: [...prev.interestDomains, { name: selectedOption, minLevel: 1, maxLevel: 5 }] 
      }));
    }
  };

  // Handle interest domain tag removal
  const handleRemoveInterestDomain = (domainName) => {
    setFilters(prev => ({
      ...prev,
      interestDomains: prev.interestDomains.filter(d => d.name !== domainName)
    }));
  };

  // Handle interest domain level change
  const handleInterestLevelChange = (domainName, minOrMax, value) => {
    setFilters(prev => ({
      ...prev,
      interestDomains: prev.interestDomains.map(domain => {
        if (domain.name === domainName) {
          if (minOrMax === 'min') {
            return { ...domain, minLevel: Number(value) };
          } else {
            return { ...domain, maxLevel: Number(value) };
          }
        }
        return domain;
      })
    }));
  };

  // Handle adding range filters (donation count, donation amount, age)
  const handleAddRangeFilter = (filterType) => {
    let min, max, rangeId, displayText;
    
    switch(filterType) {
      case 'donationCount':
        min = filters.minDonationCount;
        max = filters.maxDonationCount;
        rangeId = `donationCount_${min}-${max}`;
        displayText = `Donations: ${min || '0'}-${max || 'any'}`;
        break;
      case 'donationAmount':
        min = filters.minDonationAmount;
        max = filters.maxDonationAmount;
        rangeId = `donationAmount_${min}-${max}`;
        displayText = `Amount: $${min || '0'}-$${max || 'any'}`;
        break;
      case 'age':
        min = filters.minAge;
        max = filters.maxAge;
        rangeId = `age_${min}-${max}`;
        displayText = `Age: ${min || '0'}-${max || 'any'}`;
        break;
      default:
        return;
    }
    
    // Only add if at least one value is filled
    if (min || max) {
      if (!filters.rangeFilters) {
        setFilters(prev => ({ 
          ...prev, 
          rangeFilters: [{ id: rangeId, type: filterType, min, max, display: displayText }] 
        }));
      } else if (!filters.rangeFilters.some(filter => filter.id === rangeId)) {
        setFilters(prev => ({ 
          ...prev, 
          rangeFilters: [...prev.rangeFilters, { id: rangeId, type: filterType, min, max, display: displayText }] 
        }));
      }
    }
  };
  
  // Handle removing range filter
  const handleRemoveRangeFilter = (filterId) => {
    setFilters(prev => ({
      ...prev,
      rangeFilters: prev.rangeFilters.filter(filter => filter.id !== filterId)
    }));
  };

  // Handler for gender selection
  const handleGenderSelect = (gender) => {
    setFilters(prev => ({ ...prev, gender }));
  };

  // Handler for donor type selection
  const handleDonorTypeSelect = (type) => {
    if (type === 'company') {
      setFilters(prev => ({ ...prev, isCompany: true, donorType: type }));
    } else if (type === 'individual') {
      setFilters(prev => ({ ...prev, isCompany: false, donorType: type }));
    } else {
      setFilters(prev => ({ ...prev, donorType: type, isCompany: undefined }));
    }
  };

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const donorTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' }
  ];

  const genderOptions = [
    { value: 'all', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const donationCountRanges = [
    { value: '0-0', label: '0' },
    { value: '1-5', label: '1-5' },
    { value: '6-10', label: '6-10' },
    { value: '11-20', label: '11-20' },
    { value: '21+', label: '21+' }
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

  // Array of default interest domains to display when no backend data is available
  const defaultInterestDomains = [
    { id: 'lung-cancer', name: 'Lung Cancer Research' },
    { id: 'gastric-cancer', name: 'Gastric Cancer Research' },
    { id: 'breast-cancer', name: 'Breast Cancer Support' },
    { id: 'pediatric-health', name: 'Pediatric Healthcare' },
    { id: 'mental-health', name: 'Mental Health Awareness' },
    { id: 'disease-prevention', name: 'Disease Prevention' },
    { id: 'medical-research', name: 'Medical Research' },
    { id: 'healthcare-access', name: 'Healthcare Access' },
    { id: 'community-health', name: 'Community Health Services' },
    { id: 'elderly-care', name: 'Elderly Care Programs' }
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
          {/* Donor Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Donor Type</label>
            <div className="flex flex-wrap gap-2">
              {donorTypeOptions.map(option => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={filters.donorType === option.value || (option.value === 'all' && !filters.donorType) ? "default" : "outline"}
                  onClick={() => handleDonorTypeSelect(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map(option => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={filters.gender === option.value || (option.value === 'all' && !filters.gender) ? "default" : "outline"}
                  onClick={() => handleGenderSelect(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Donation Count Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Donation Count</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Min"
                  name="minDonationCount"
                  value={filters.minDonationCount}
                  onChange={handleInputChange}
                  className="w-20"
                />
                <span>-</span>
                <Input
                  placeholder="Max"
                  name="maxDonationCount"
                  value={filters.maxDonationCount}
                  onChange={handleInputChange}
                  className="w-20"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleClearFilter('minDonationCount');
                    handleClearFilter('maxDonationCount');
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddRangeFilter('donationCount')}
                >
                  Add
                </Button>
              </div>
              
              {/* Display applied filters */}
              {filters.rangeFilters && filters.rangeFilters.filter(filter => filter.type === 'donationCount').length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.rangeFilters
                    .filter(filter => filter.type === 'donationCount')
                    .map(filter => (
                      <span 
                        key={filter.id} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {filter.display}
                        <button 
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-800 focus:outline-none"
                          onClick={() => handleRemoveRangeFilter(filter.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters (expandable) */}
        {expanded && (
          <div className="flex flex-col gap-4 border-t pt-4">
            {/* Age Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Age Range</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Min"
                    name="minAge"
                    value={filters.minAge}
                    onChange={handleInputChange}
                    className="w-20"
                  />
                  <span>-</span>
                  <Input
                    placeholder="Max"
                    name="maxAge"
                    value={filters.maxAge}
                    onChange={handleInputChange}
                    className="w-20"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleClearFilter('minAge');
                      handleClearFilter('maxAge');
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddRangeFilter('age')}
                  >
                    Add
                  </Button>
                </div>
                
                {/* Display applied filters */}
                {filters.rangeFilters && filters.rangeFilters.filter(filter => filter.type === 'age').length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.rangeFilters
                      .filter(filter => filter.type === 'age')
                      .map(filter => (
                        <span 
                          key={filter.id} 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {filter.display}
                          <button 
                            type="button"
                            className="ml-1 text-blue-500 hover:text-blue-800 focus:outline-none"
                            onClick={() => handleRemoveRangeFilter(filter.id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total Donations Amount Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Total Donation Amount</label>
              <div className="flex flex-col gap-2">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddRangeFilter('donationAmount')}
                  >
                    Add
                  </Button>
                </div>
                
                {/* Display applied filters */}
                {filters.rangeFilters && filters.rangeFilters.filter(filter => filter.type === 'donationAmount').length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.rangeFilters
                      .filter(filter => filter.type === 'donationAmount')
                      .map(filter => (
                        <span 
                          key={filter.id} 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {filter.display}
                          <button 
                            type="button"
                            className="ml-1 text-blue-500 hover:text-blue-800 focus:outline-none"
                            onClick={() => handleRemoveRangeFilter(filter.id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location Filter (Dropdown) */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="flex flex-col gap-2">
                {/* Dropdown for selecting locations */}
                <div className="flex gap-2">
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={handleLocationSelect}
                    value=""
                  >
                    <option value="">Select a location...</option>
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
                    onClick={() => handleClearFilter('locations')}
                  >
                    Clear
                  </Button>
                </div>

                {/* Display selected locations as tags */}
                {filters.locations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.locations.map(location => (
                      <span 
                        key={location} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {location}
                        <button 
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-800 focus:outline-none"
                          onClick={() => handleRemoveLocation(location)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Interest Domains Filter */}
            {availableFilters.interestDomains && (
              <div>
                <label className="block text-sm font-medium mb-2">Interest Domains</label>
                <div className="flex flex-col gap-2">
                  {/* Dropdown for selecting interest domains */}
                  <div className="flex gap-2">
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={handleInterestDomainSelect}
                      value=""
                    >
                      <option value="">Select an interest domain...</option>
                      
                      {/* Use backend options if available */}
                      {availableFilters.interestDomains && availableFilters.interestDomains.length > 0 ? (
                        <optgroup label="Available Interest Domains">
                          {availableFilters.interestDomains.map(domain => (
                            <option key={domain.id} value={domain.name}>{domain.name}</option>
                          ))}
                        </optgroup>
                      ) : (
                        /* Use default options if no backend data */
                        <optgroup label="Common Interest Domains">
                          {defaultInterestDomains.map(domain => (
                            <option key={domain.id} value={domain.name}>{domain.name}</option>
                          ))}
                        </optgroup>
                      )}
                      
                      {/* Always show preset medical domains */}
                      {availableFilters.interestDomains && availableFilters.interestDomains.length > 0 && (
                        <optgroup label="Common Health Topics">
                          {defaultInterestDomains
                            .filter(domain => domain.name.includes('Cancer') || domain.name.includes('Research') || domain.name.includes('Health'))
                            .filter(domain => !availableFilters.interestDomains.some(item => item.name === domain.name))
                            .map(domain => (
                              <option key={domain.id} value={domain.name}>{domain.name}</option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearFilter('interestDomains')}
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Display selected interest domains as tags with interest level controls */}
                  {filters.interestDomains.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {filters.interestDomains.map(domain => (
                        <div 
                          key={domain.name} 
                          className="flex flex-col p-2 rounded border border-green-200 bg-green-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">{domain.name}</span>
                            <button 
                              type="button"
                              className="text-green-500 hover:text-green-800 focus:outline-none"
                              onClick={() => handleRemoveInterestDomain(domain.name)}
                            >
                              ×
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-green-700">Interest Level:</label>
                            <div className="flex items-center gap-1">
                              <select 
                                className="h-6 w-16 text-xs rounded border-green-200"
                                value={domain.minLevel}
                                onChange={(e) => handleInterestLevelChange(domain.name, 'min', e.target.value)}
                              >
                                {[1, 2, 3, 4, 5].map(level => (
                                  <option key={`min-${level}`} value={level}>{level}</option>
                                ))}
                              </select>
                              <span className="text-xs">to</span>
                              <select 
                                className="h-6 w-16 text-xs rounded border-green-200"
                                value={domain.maxLevel}
                                onChange={(e) => handleInterestLevelChange(domain.name, 'max', e.target.value)}
                              >
                                {[1, 2, 3, 4, 5].map(level => (
                                  <option key={`max-${level}`} value={level}>{level}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags Filter */}
            {availableFilters.tags && availableFilters.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.tags.map(tag => (
                    <Button
                      key={tag.id}
                      size="sm"
                      variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                      onClick={() => handleToggleArrayFilter('tags', tag.name)}
                      style={filters.tags.includes(tag.name) ? { backgroundColor: tag.color, color: 'white' } : {}}
                    >
                      {tag.name}
                    </Button>
                  ))}
                  {filters.tags.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearFilter('tags')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Custom Tag Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Custom Tags</label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom tag"
                    name="customTag"
                    value={filters.customTag || ''}
                    onChange={handleInputChange}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (filters.customTag && filters.customTag.trim() !== '') {
                        handleToggleArrayFilter('tags', filters.customTag.trim());
                        setFilters(prev => ({ ...prev, customTag: '' }));
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                
                {/* Display added custom tags */}
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
                          onClick={() => handleToggleArrayFilter('tags', tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonorFilters; 