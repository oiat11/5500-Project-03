import { PrismaClient, ContactPhoneType, SubscriptionPreference, CommunicationPreference } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {errorHandler} from "../utils/error.js";
import csv from 'csv-parser';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export const createDonor = async (req, res, next) => {
  try {
    if (!req.user) {
      return next({
        statusCode: 401,
        message: 'Unauthorized: Please log in',
        isPublic: true,
      });
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
      exclude = false,
      deceased = false,
      contact_phone_type,
      phone_restrictions,
      email_restrictions,
      communication_restrictions,
      subscription_events_in_person,
      subscription_events_magazine,
      communication_preference,
      tagIds = [],
    } = req.body;

    if (!pmm) {
      return next({
        statusCode: 400,
        message: 'PMM is required',
        isPublic: true,
      });
    }

    const safeEnum = (value, fallback) => {
      return typeof value === 'string' && value.trim() !== '' ? value : fallback;
    };

    const existingDonor = await prisma.donor.findFirst({
      where: {
        first_name,
        last_name,
        organization_name,
        street_address,
      },
    });

    if (existingDonor) {
      return next({
        statusCode: 409,
        message: 'Donor already exists with the same name and address.',
        isPublic: true,
      });
    }

    //Create the donor
    const newDonor = await prisma.donor.create({
      data: {
        first_name,
        nick_name,
        last_name,
        organization_name,
        unit_number,
        street_address,
        city,
        total_donation_amount: total_donation_amount ?? 0,
        total_pledge,
        largest_gift_amount,
        largest_gift_appeal: largest_gift_appeal || null,
        last_gift_amount,
        last_gift_request: last_gift_request || null,
        last_gift_appeal: last_gift_appeal || null,
        first_gift_date,
        pmm,
        exclude,
        deceased,
        contact_phone_type: safeEnum(contact_phone_type, 'Mobile'),
        phone_restrictions: phone_restrictions || null,
        email_restrictions: email_restrictions || null,
        communication_restrictions: communication_restrictions || null,
        subscription_events_in_person: safeEnum(subscription_events_in_person, 'Opt_in'),
        subscription_events_magazine: safeEnum(subscription_events_magazine, 'Opt_in'),
        communication_preference: safeEnum(communication_preference, 'Thank_you'),
      },
    });

    //Create donor-tag relations manually
    if (tagIds.length > 0) {
      await prisma.donorTag.createMany({
        data: tagIds.map((tagId) => ({
          donor_id: newDonor.id,
          tag_id: tagId,
        })),
        skipDuplicates: true,
      });
    }

    //Fetch donor again including tags
    const donorWithTags = await prisma.donor.findUnique({
      where: { id: newDonor.id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      donor: donorWithTags,
    });
  } catch (error) {
    console.error('Error creating donor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create donor',
      error: error.message,
    });
  }
};



// function to get all donors
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

// function to get donors with search, pagination, filters, and pmm search
export const getDonors = async (req, res, next) => {
  try {
    if (!req.user) return next(errorHandler(401, 'Unauthorized: Please log in'));


    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      minDonationAmount,
      maxDonationAmount,
      tags,
      city,
      pmm,
      largestGiftAppeal,
      contactPhoneType,
      phoneRestrictions,
      emailRestrictions,
      communicationRestrictions
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let whereClause = { is_deleted: false };

    // city filter allow multiple cities
    if (city) {
      const cities = typeof city === 'string' ? city.split(',') : city;
      whereClause.city = { in: cities };
    }

    // pmm filter (partial match)
    if (pmm) {
      whereClause.pmm = { contains: pmm };
    }

    // Largest gift appeal filter
    if (largestGiftAppeal) {
      const appeals = typeof largestGiftAppeal === 'string' ? largestGiftAppeal.split(',') : largestGiftAppeal;
      whereClause.largest_gift_appeal = { in: appeals };
    }

    // Contact phone type filter
    if (contactPhoneType && contactPhoneType !== 'all') {
      whereClause.contact_phone_type = contactPhoneType;
    }

    // Phone restrictions filter
    if (phoneRestrictions) {
      const restrictions = typeof phoneRestrictions === 'string' ? phoneRestrictions.split(',') : phoneRestrictions;
      
      // 创建一个 OR 条件数组
      let phoneConditions = [];
      
      // 如果包含 "None"，添加 null 条件
      if (restrictions.includes('None')) {
        phoneConditions.push({ phone_restrictions: null });
      }
      
      // 添加其他非空值条件
      const nonNoneRestrictions = restrictions.filter(r => r !== 'None');
      if (nonNoneRestrictions.length > 0) {
        phoneConditions.push({ phone_restrictions: { in: nonNoneRestrictions } });
      }
      
      // 如果有多个条件，使用 OR 连接
      if (phoneConditions.length > 0) {
        // 如果已经有 OR 条件，合并
        if (whereClause.OR) {
          whereClause.OR = [...whereClause.OR, ...phoneConditions];
        } else {
          whereClause.OR = phoneConditions;
        }
      }
    }

    // Email restrictions filter
    if (emailRestrictions) {
      const restrictions = typeof emailRestrictions === 'string' ? emailRestrictions.split(',') : emailRestrictions;
      
      // 创建一个 OR 条件数组
      let emailConditions = [];
      
      // 如果包含 "None"，添加 null 条件
      if (restrictions.includes('None')) {
        emailConditions.push({ email_restrictions: null });
      }
      
      // 添加其他非空值条件
      const nonNoneRestrictions = restrictions.filter(r => r !== 'None');
      if (nonNoneRestrictions.length > 0) {
        emailConditions.push({ email_restrictions: { in: nonNoneRestrictions } });
      }
      
      // 如果有多个条件，使用 OR 连接
      if (emailConditions.length > 0) {
        // 如果已经有 OR 条件，合并
        if (whereClause.OR) {
          whereClause.OR = [...whereClause.OR, ...emailConditions];
        } else {
          whereClause.OR = emailConditions;
        }
      }
    }

    // Communication restrictions filter
    if (communicationRestrictions) {
      const restrictions = typeof communicationRestrictions === 'string' ? communicationRestrictions.split(',') : communicationRestrictions;
      
      // 创建一个 OR 条件数组
      let commConditions = [];
      
      // 如果包含 "None"，添加 null 条件
      if (restrictions.includes('None')) {
        commConditions.push({ communication_restrictions: null });
      }
      
      // 添加其他非空值条件
      const nonNoneRestrictions = restrictions.filter(r => r !== 'None');
      if (nonNoneRestrictions.length > 0) {
        commConditions.push({ communication_restrictions: { in: nonNoneRestrictions } });
      }
      
      // 如果有多个条件，使用 OR 连接
      if (commConditions.length > 0) {
        // 如果已经有 OR 条件，合并
        if (whereClause.OR) {
          whereClause.OR = [...whereClause.OR, ...commConditions];
        } else {
          whereClause.OR = commConditions;
        }
      }
    }

    // Donation filter
    if (minDonationAmount !== undefined || maxDonationAmount !== undefined) {
      whereClause.total_donation_amount = {};
      if (minDonationAmount !== undefined) {
        whereClause.total_donation_amount.gte = parseFloat(minDonationAmount);
      }
      if (maxDonationAmount !== undefined) {
        whereClause.total_donation_amount.lte = parseFloat(maxDonationAmount);
      }
    }

    // Tags filter
    const tagsFilter = tags
      ? {
          tags: {
            some: {
              tag: {
                name: {
                  in: Array.isArray(tags) ? tags : [tags]
                }
              }
            }
          }
        }
      : {};

    // Search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        OR: [
          { first_name: { contains: search } },
          { last_name: { contains: search } },
          { organization_name: { contains: search } }
        ]
      };
    }

    const finalWhere = {
      ...whereClause,
      ...tagsFilter,
      ...searchFilter
    };

    const totalDonors = await prisma.donor.count({
      where: finalWhere 
    });

    const donors = await prisma.donor.findMany({
      where: finalWhere,
      include: {
        tags: { include: { tag: true } },
        events: true
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum
    });
    res.status(200).json({
      donors,
      pagination: {
        total: totalDonors,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalDonors / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDonorById = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const { id } = req.params;
    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.status(200).json(donor);
  } catch (error) {
    next(error);
  }
};

export const updateDonor = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Updating donor with ID:', id);
    console.log('Update data received:', req.body);

    // 提取标签 ID
    const { tagIds, ...donorData } = req.body;

    // 处理数值字段
    const updateData = {
      ...donorData,
      total_donation_amount: donorData.total_donation_amount 
        ? new Decimal(donorData.total_donation_amount) 
        : new Decimal(0),
      total_pledge: donorData.total_pledge 
        ? new Decimal(donorData.total_pledge) 
        : null,
      largest_gift_amount: donorData.largest_gift_amount 
        ? new Decimal(donorData.largest_gift_amount) 
        : null,
      last_gift_amount: donorData.last_gift_amount 
        ? new Decimal(donorData.last_gift_amount) 
        : null,
    };

    // 移除不需要更新的字段
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    delete updateData.tags;
    delete updateData.events;

    console.log('Processed update data:', updateData);

    // 开始事务处理
    const updatedDonor = await prisma.$transaction(async (tx) => {
      // 1. 更新捐赠者基本信息
      const donor = await tx.donor.update({
        where: { id },
        data: updateData,
      });

      // 2. 如果提供了标签 ID，更新标签关联
      if (tagIds && Array.isArray(tagIds)) {
        // 删除现有标签关联
        await tx.donorTag.deleteMany({
          where: { donor_id: id }
        });

        // 创建新的标签关联
        for (const tagId of tagIds) {
          await tx.donorTag.create({
            data: {
              donor_id: id,
              tag_id: tagId
            }
          });
        }
      }

      // 返回更新后的捐赠者数据，包括标签
      return tx.donor.findUnique({
        where: { id },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    console.log('Donor updated successfully');

    return res.status(200).json({
      success: true,
      message: 'Donor updated successfully',
      donor: updatedDonor
    });
  } catch (error) {
    console.error('Error updating donor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update donor',
      error: error.message
    });
  }
};

export const deleteDonor = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized: Please log in' });

    const { id } = req.params;
    const existingDonor = await prisma.donor.findUnique({ where: { id } });
    if (!existingDonor || existingDonor.is_deleted)
      return res.status(404).json({ message: 'Donor not found' });

    await prisma.donor.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() }
    });

    res.status(200).json({ message: 'Donor deleted successfully' });
  } catch (error) {
    console.error('Error deleting donor:', error);
    res.status(500).json({ message: 'Error deleting donor', error: error.message });
  }
};

// function to import donors from CSV with update or create logic
export const importDonorsCsv = async (req, res, next) => {
  try {
    if (!req.user) return next(errorHandler(401, 'Unauthorized: Please log in'));
    if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });

    const results = [];
    const errors = [];

    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', (error) => reject(error))
        .on('end', () => resolve());
    });

    const parseDate = (value) => {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    };

    const normalizeCity = (cityName) => cityName?.replaceAll(' ', '_');
    const normalizeEnum = (value) => value?.trim()?.replace(/\s+/g, '_').replace(/-/g, '_') || null;

    const importedDonors = [];
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of results) {
      try {
        const donorData = {
          first_name: row.first_name,
          nick_name: row.nick_name || null,
          last_name: row.last_name,
          organization_name: row.organization_name || null,
          unit_number: row.address_line2 || null,
          street_address: row.address_line1,
          city: normalizeCity(row.city),
          total_donation_amount: new Decimal(parseFloat(row.total_donations) || 0),
          total_pledge: row.total_pledge ? new Decimal(parseFloat(row.total_pledge)) : null,
          largest_gift_amount: row.largest_gift_amount ? new Decimal(parseFloat(row.largest_gift_amount)) : null,
          largest_gift_appeal: row.largest_gift_appeal || null,
          last_gift_amount: row.last_gift_amount ? new Decimal(parseFloat(row.last_gift_amount)) : null,
          last_gift_request: row.last_gift_request || null,
          last_gift_appeal: row.last_gift_appeal || null,
          first_gift_date: parseDate(row.first_gift_date),
          last_gift_date: parseDate(row.last_gift_date),
          pmm: row.pmm,
          exclude: row.exclude === 'true',
          deceased: row.deceased === 'true',
          contact_phone_type: normalizeEnum(row.contact_phone_type),
          phone_restrictions: row.phone_restrictions || null,
          email_restrictions: row.email_restrictions || null,
          communication_restrictions: row.communication_restrictions || null,
          subscription_events_in_person: normalizeEnum(row.subscription_events_in_person),
          subscription_events_magazine: normalizeEnum(row.subscription_events_magazine),
          communication_preference: normalizeEnum(row.communication_preference),
          is_deleted: false,
          deleted_at: null
        };

        // First try to find an active donor
        let existingDonor = await prisma.donor.findFirst({
          where: {
            first_name: donorData.first_name,
            last_name: donorData.last_name,
            organization_name: donorData.organization_name,
            street_address: donorData.street_address,
            is_deleted: false
          }
        });

        // If no active donor found, look for a deleted one
        if (!existingDonor) {
          existingDonor = await prisma.donor.findFirst({
            where: {
              first_name: donorData.first_name,
              last_name: donorData.last_name,
              organization_name: donorData.organization_name,
              street_address: donorData.street_address,
              is_deleted: true
            }
          });
        }

        if (existingDonor) {
          // Update the donor (this will also restore if it was deleted)
          const updatedDonor = await prisma.donor.update({
            where: { id: existingDonor.id },
            data: donorData
          });
          importedDonors.push(updatedDonor);
          updatedCount++;
        } else {
          const newDonor = await prisma.donor.create({ data: donorData });
          importedDonors.push(newDonor);
          createdCount++;
        }
      } catch (error) {
        errors.push(`Row ${results.indexOf(row) + 1}: ${error.message}`);
      }
    }

    res.status(200).json({
      message: 'Donors imported successfully',
      createdCount,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing donors from CSV:', error);
    next(error);
  }
};

export const getAvailableCities = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const cities = await prisma.donor.findMany({
      where: { is_deleted: false },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' }
    });

    res.status(200).json({
      cities: cities.map(city => city.city)
    });
  } catch (error) {
    next(error);
  }
};

// routes/donor.js or similar
export const recommendDonors = async (req, res, next) => {
  try {
    if (!req.user) return next(errorHandler(401, 'Unauthorized: Please log in'));

    const {
      count = 50, 
      excludeIds,
      eventId,
      minDonationAmount,
      maxDonationAmount,
      city,
      tags,
      search,
      sortBy = 'ml_score',
    } = req.query;

    const take = parseInt(count);
    const excludeIdArray = excludeIds
      ? excludeIds
          .split(',')
          .map(id => id.trim())
          .filter(id => id !== "")
      : [];

    // Base where clause
    let whereClause = {
      is_deleted: false,
    };

    // ✅ Exclude donors that have already been selected or passed in
    if (excludeIdArray.length > 0) {
      whereClause.id = { notIn: excludeIdArray };
    }

    // ✅ Exclude donors already in this event (if provided)
    if (eventId) {
      whereClause.events = {
        none: {
          event_id: parseInt(eventId),
        },
      };
    }

    // ✅ Filter by city
    if (city) {
      const cities = typeof city === 'string' ? city.split(',') : city;
      whereClause.city = { in: cities };
    }

    // ✅ Filter by donation range
    if (minDonationAmount || maxDonationAmount) {
      whereClause.total_donation_amount = {};
      if (minDonationAmount !== undefined) {
        whereClause.total_donation_amount.gte = parseFloat(minDonationAmount);
      }
      if (maxDonationAmount !== undefined) {
        whereClause.total_donation_amount.lte = parseFloat(maxDonationAmount);
      }
    }

    // ✅ Name keyword search
    if (search) {
      whereClause.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
      ];
    }

    // ✅ Filter by tags (optional)
    const tagsFilter = tags
      ? {
          tags: {
            some: {
              tag: {
                name: {
                  in: Array.isArray(tags) ? tags : [tags],
                },
              },
            },
          },
        }
      : {};

    // ✅ Combine all filters
    const finalWhere = {
      ...whereClause,
      ...tagsFilter,
    };

    // ✅ Sort fallback
    const allowedSortFields = ['ml_score', 'total_donation_amount'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'ml_score';

    const recommendedDonors = await prisma.donor.findMany({
      where: finalWhere,
      include: {
        tags: { include: { tag: true } },
        events: true,
      },
      orderBy: {
        [safeSortBy]: 'desc',
      },
      take,
    });

    res.status(200).json({
      sortBy: safeSortBy,
      recommended: recommendedDonors,
    });

  } catch (error) {
    console.error("❌ recommendDonors error:", error);
    next(error);
  }
};
