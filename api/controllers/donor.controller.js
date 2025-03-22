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
      isCompany
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

    // Count total donors matching the criteria
    const totalDonors = await prisma.donor.count({
      where: whereClause
    });

    // Fetch donors with pagination, sorting and filtering
    const donors = await prisma.donor.findMany({
      where: whereClause,
      include: {
        last_donation: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limitNum
    });

    const totalPages = Math.ceil(totalDonors / limitNum);

    res.status(200).json({
      donors,
      pagination: {
        total: totalDonors,
        page: pageNum,
        limit: limitNum,
        totalPages
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
