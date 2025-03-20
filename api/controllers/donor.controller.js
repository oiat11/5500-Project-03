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
