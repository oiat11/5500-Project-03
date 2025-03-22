import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createDonor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const {
      first_name,
      middle_name,
      last_name,
      gender,
      age,
      email,
      phone_number,
      address,
      registration_date,
      last_donation_date,
      total_donation_amount,
      total_donations_count,
      anonymous_donation_preference,
      interest_domain,
      is_merged,
      is_company,
      merge_to_donor_id,
      communication_preference
    } = req.body;

    const newDonor = await prisma.donor.create({
      data: {
        first_name,
        middle_name,
        last_name,
        gender,
        age,
        email,
        phone_number,
        address,
        registration_date: registration_date || new Date(),
        last_donation_date,
        total_donation_amount: total_donation_amount || 0.0,
        total_donations_count: total_donations_count || 0,
        anonymous_donation_preference: anonymous_donation_preference || false,
        interest_domain,
        is_merged: is_merged || false,
        is_company: is_company || false,
        merge_to_donor_id,
        communication_preference
      }
    });

    res.status(201).json({ message: 'Donor created successfully', donor: newDonor });
  } catch (error) {
    res.status(500).json({ message: 'Error creating donor', error: error.message });
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
