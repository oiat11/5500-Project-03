import { PrismaClient } from '@prisma/client';
import {errorHandler} from "../utils/error.js";
import csv from 'csv-parser';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export const createDonor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const {
      first_name,
      nick_name,
      last_name,
      organization_name,
      unit_number,
      street_address,
      city,
      total_donation_amount,
      total_pledge,
      largest_gift_amount,
      largest_gift_appeal,
      last_gift_amount,
      last_gift_request,
      last_gift_appeal,
      first_gift_date,
      pmm,
      exclude,
      deceased,
      contact_phone_type,
      phone_restrictions,
      email_restrictions,
      communication_restrictions,
      subscription_events_in_person,
      subscription_events_magazine,
      communication_preference,
      tagIds = []
    } = req.body;

    if (!pmm) {
      return res.status(400).json({ message: 'PMM is required' });
    }

    const newDonor = await prisma.donor.create({
      data: {
        first_name,
        nick_name,
        last_name,
        organization_name,
        unit_number,
        street_address,
        city,
        total_donation_amount: total_donation_amount || 0,
        total_pledge,
        largest_gift_amount,
        largest_gift_appeal,
        last_gift_amount,
        last_gift_request,
        last_gift_appeal,
        first_gift_date,
        pmm,
        exclude: exclude || false,
        deceased: deceased || false,
        contact_phone_type: contact_phone_type || 'mobile',
        phone_restrictions,
        email_restrictions,
        communication_restrictions,
        subscription_events_in_person: subscription_events_in_person || 'opt_in',
        subscription_events_magazine: subscription_events_magazine || 'opt_in',
        communication_preference: communication_preference || 'Thank_you',
        tags: tagIds.length > 0 ? {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Donor created successfully', donor: newDonor });
  } catch (error) {
    next(error);
  }
};

export const getAllDonors = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const donors = await prisma.donor.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        organization_name: true,
        city: true,
        pmm: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: "Donors fetched successfully",
      donors
    });
  } catch (error) {
    console.error("Error fetching all donors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donors",
      error: error.message
    });
  }
};


export const getDonors = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const { 
      search,
      page = 1, 
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      isCompany,
      minAge,
      maxAge,
      minDonationAmount,
      maxDonationAmount,
      minDonationCount,
      maxDonationCount,
      gender,
      location,
      interestDomains,
      donorType,
      tags
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build the where clause based on search parameters
    let whereClause = {
      is_deleted: false
    };

    // Filter by company status if provided
    if (isCompany !== undefined) {
      whereClause.is_company = isCompany === 'true';
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { organization_name: { contains: search } },
        { email: { contains: search } },
        { phone_number: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
        { state: { contains: search } },
        { postal_code: { contains: search } }
      ];
    }

    // Age filter
    if (minAge !== undefined) {
      whereClause.age = {
        ...whereClause.age,
        gte: parseInt(minAge)
      };
    }
    if (maxAge !== undefined) {
      whereClause.age = {
        ...whereClause.age,
        lte: parseInt(maxAge)
      };
    }

    // Gender filter
    if (gender && gender !== 'all') {
      whereClause.gender = gender;
    }

    // Location filter
    if (location) {
      const locations = Array.isArray(location) ? location : [location];
      whereClause.OR = [
        ...(whereClause.OR || []),
        ...locations.map(loc => ({ 
          city: { contains: loc } 
        })),
        ...locations.map(loc => ({ 
          state: { contains: loc } 
        })),
        ...locations.map(loc => ({ 
          country: { contains: loc } 
        }))
      ];
    }

    // Total donation amount filter
    if (minDonationAmount !== undefined) {
      whereClause.total_donation_amount = {
        ...whereClause.total_donation_amount,
        gte: parseFloat(minDonationAmount)
      };
    }
    if (maxDonationAmount !== undefined) {
      whereClause.total_donation_amount = {
        ...whereClause.total_donation_amount,
        lte: parseFloat(maxDonationAmount)
      };
    }

    // Total donation count filter
    if (minDonationCount !== undefined) {
      whereClause.total_donations_count = {
        ...whereClause.total_donations_count,
        gte: parseInt(minDonationCount)
      };
    }
    if (maxDonationCount !== undefined) {
      whereClause.total_donations_count = {
        ...whereClause.total_donations_count,
        lte: parseInt(maxDonationCount)
      };
    }

    // Interest domains filter
    let interestDomainsFilter = {};
    if (interestDomains) {
      const domains = Array.isArray(interestDomains) 
        ? interestDomains 
        : [interestDomains];
      
      // Check if we have interest domain level filters
      if (req.query.interestDomainsCount) {
        const count = parseInt(req.query.interestDomainsCount);
        
        // Build a complex filter with level constraints for each domain
        const domainFilters = [];
        
        for (let i = 0; i < count; i++) {
          const domainName = req.query[`interestDomainLevel_${i}_name`];
          const minLevel = parseInt(req.query[`interestDomainLevel_${i}_min`]) || 1;
          const maxLevel = parseInt(req.query[`interestDomainLevel_${i}_max`]) || 5;
          
          if (domainName) {
            domainFilters.push({
              interest_domains: {
                some: {
                  interest_domain: {
                    name: domainName
                  },
                  level: {
                    gte: minLevel,
                    lte: maxLevel
                  }
                }
              }
            });
          }
        }
        
        if (domainFilters.length > 0) {
          interestDomainsFilter = {
            OR: domainFilters
          };
        }
      } else {
        // Simple domain name filtering (backward compatibility)
        interestDomainsFilter = {
          interest_domains: {
            some: {
              interest_domain: {
                name: {
                  in: domains
                }
              }
            }
          }
        };
      }
    }

    // Tags filter
    let tagsFilter = {};
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      tagsFilter = {
        tags: {
          some: {
            tag: {
              name: {
                in: tagList
              }
            }
          }
        }
      };
    }

    // Count total donors matching the criteria
    const totalDonors = await prisma.donor.count({
      where: {
        ...whereClause,
        ...interestDomainsFilter,
        ...tagsFilter
      }
    });

    // Fetch donors with pagination, sorting and filtering
    const donors = await prisma.donor.findMany({
      where: {
        ...whereClause,
        ...interestDomainsFilter,
        ...tagsFilter
      },
      include: {
        last_donation: true,
        tags: {
          include: {
            tag: true
          }
        },
        interest_domains: {
          include: {
            interest_domain: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limitNum
    });

    // Get all available interest domains and tags for filters
    const allInterestDomains = await prisma.interestDomain.findMany({
      select: {
        id: true,
        name: true
      }
    });

    const allTags = await prisma.tag.findMany({
      where: {
        is_deleted: false
      },
      select: {
        id: true,
        name: true,
        color: true
      }
    });

    // Get all locations for filters
    const cities = await prisma.donor.groupBy({
      by: ['city'],
      where: {
        city: {
          not: null
        },
        is_deleted: false
      }
    });

    const states = await prisma.donor.groupBy({
      by: ['state'],
      where: {
        state: {
          not: null
        },
        is_deleted: false
      }
    });

    const countries = await prisma.donor.groupBy({
      by: ['country'],
      where: {
        country: {
          not: null
        },
        is_deleted: false
      }
    });

    const locations = {
      cities: cities.map(c => c.city).filter(Boolean),
      states: states.map(s => s.state).filter(Boolean),
      countries: countries.map(c => c.country).filter(Boolean)
    };

    const totalPages = Math.ceil(totalDonors / limitNum);

    res.status(200).json({
      donors,
      pagination: {
        total: totalDonors,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      filters: {
        interestDomains: allInterestDomains,
        tags: allTags,
        locations
      }
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ message: 'Error fetching donors', error: error.message });
  }
};

export const getDonorById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const { id } = req.params;

    const donor = await prisma.donor.findUnique({
      where: { id, is_deleted: false },
      include: {
        last_donation: true,
        donations: {
          include: {
            donation: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        interest_domains: {
          include: {
            interest_domain: true
          }
        },
        communications: true
      }
    });

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.status(200).json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donor', error: error.message });
  }
};

export const updateDonor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id, is_deleted: false }
    });

    if (!existingDonor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Update donor
    const updatedDonor = await prisma.donor.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Donor updated successfully', donor: updatedDonor });
  } catch (error) {
    console.error('Error updating donor:', error);
    res.status(500).json({ message: 'Error updating donor', error: error.message });
  }
};

export const deleteDonor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const { id } = req.params;

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id, is_deleted: false }
    });

    if (!existingDonor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Soft delete the donor (set is_deleted flag to true)
    await prisma.donor.update({
      where: { id },
      data: { is_deleted: true }
    });

    res.status(200).json({ message: 'Donor deleted successfully' });
  } catch (error) {
    console.error('Error deleting donor:', error);
    res.status(500).json({ message: 'Error deleting donor', error: error.message });
  }
};

// Helper function to validate and format donor data from CSV
const validateDonorData = (data) => {
  const donor = {};
  
  // Required fields with defaults
  donor.first_name = data.first_name || null;
  donor.last_name = data.last_name || null;
  donor.organization_name = data.organization_name || null;
  donor.email = data.email || null;
  donor.phone_number = data.phone_number || null;
  donor.is_company = data.is_company === 'true' || data.is_company === true || false;
  
  // Optional fields with defaults
  donor.gender = data.gender || null;
  donor.age = data.age ? parseInt(data.age) : null;
  donor.address = data.address || null;
  donor.city = data.city || null;
  donor.state = data.state || null;
  donor.postal_code = data.postal_code || null;
  donor.country = data.country || null;
  donor.total_donation_amount = data.total_donation_amount ? parseFloat(data.total_donation_amount) : 0;
  donor.total_donations_count = data.total_donations_count ? parseInt(data.total_donations_count) : 0;
  donor.anonymous_donation_preference = data.anonymous_donation_preference === 'true' || data.anonymous_donation_preference === true || false;
  
  // Validate email if provided (must be unique)
  if (donor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor.email)) {
    throw new Error(`Invalid email format: ${donor.email}`);
  }
  
  return donor;
};

export const importDonorsCsv = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }
    
    const results = [];
    const errors = [];
    
    // Create a readable stream from the buffer
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    
    // Process the CSV file
    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', (error) => reject(error))
        .on('end', () => resolve());
    });
    
    // Validate and import each donor
    const importedDonors = [];
    for (const row of results) {
      try {
        const donorData = validateDonorData(row);
        
        // Check if donor with this email already exists
        if (donorData.email) {
          const existingDonor = await prisma.donor.findUnique({
            where: { email: donorData.email }
          });
          
          if (existingDonor) {
            // Update existing donor
            const updatedDonor = await prisma.donor.update({
              where: { email: donorData.email },
              data: donorData
            });
            importedDonors.push(updatedDonor);
          } else {
            // Create new donor
            const newDonor = await prisma.donor.create({
              data: donorData
            });
            importedDonors.push(newDonor);
          }
        } else {
          // Create donor without email
          const newDonor = await prisma.donor.create({
            data: donorData
          });
          importedDonors.push(newDonor);
        }
      } catch (error) {
        errors.push(`Row ${results.indexOf(row) + 1}: ${error.message}`);
      }
    }
    
    res.status(200).json({
      message: 'Donors imported successfully',
      importedCount: importedDonors.length,
      totalRows: results.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing donors from CSV:', error);
    res.status(500).json({ message: 'Error importing donors', error: error.message });
  }
};

export const recommendDonors = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const { tagIds = [], count = 10 } = req.body;
    
    // 如果没有提供标签，按捐赠金额排序
    if (tagIds.length === 0) {
      const topDonors = await prisma.donor.findMany({
        where: {
          exclude: false,
          deceased: false
        },
        orderBy: {
          total_donation_amount: 'desc'
        },
        take: count,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
      
      const formattedDonors = topDonors.map(donor => ({
        value: donor.id,
        label: donor.organization_name || `${donor.first_name} ${donor.last_name}`,
        tags: donor.tags.map(t => t.tag),
        totalDonation: donor.total_donation_amount || 0,
        city: donor.city
      }));
      
      return res.status(200).json({ donors: formattedDonors });
    }
    
    // 如果提供了标签，查找匹配标签的捐赠者
    // 使用原生SQL或Prisma的复杂查询来实现更高效的推荐
    const donorsWithTags = await prisma.donor.findMany({
      where: {
        exclude: false,
        deceased: false,
        tags: {
          some: {
            tag_id: {
              in: tagIds
            }
          }
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    // 计算匹配分数
    const scoredDonors = donorsWithTags.map(donor => {
      const matchingTagCount = donor.tags.filter(t => 
        tagIds.includes(t.tagId)
      ).length;
      
      return {
        donor,
        score: matchingTagCount + (donor.total_donation_amount / 10000 || 0)
      };
    });
    
    // 按分数排序并限制数量
    const recommendedDonors = scoredDonors
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => ({
        value: item.donor.id,
        label: item.donor.organization_name || `${item.donor.first_name} ${item.donor.last_name}`,
        tags: item.donor.tags.map(t => t.tag),
        totalDonation: item.donor.total_donation_amount || 0,
        city: item.donor.city
      }));
    
    res.status(200).json({ donors: recommendedDonors });
  } catch (error) {
    next(errorHandler(error));
  }
};
