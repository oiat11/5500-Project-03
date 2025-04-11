import { PrismaClient } from '@prisma/client';
import { errorHandler } from '../utils/error.js';

const prisma = new PrismaClient();

// Create Event with Tags and Donors
export const createEventWithDonors = async (req, res, next) => {
  const { name, description, date, location, tagIds = [], donors = [], status, donor_count } = req.body;

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        status,
        created_by: String(req.user.id),
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
        donor_count,
        donors: {
          create: donors.map((d) => ({
            donor: { connect: { id: d.donorId } },
            status: d.status,
          })),
        },
      },
      include: {
        tags: true,
        donors: {
          include: { donor: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Events
export const getEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { is_deleted: false },
      include: {
        tags: true,
        donors: {
          include: { donor: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      events,
    });
  } catch (err) {
    next(err);
  }
};

// Get Event by ID
export const getEventById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        tags: true,
        donors: {
          include: {
            donor: {
              include: {
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        }
      }
    });
    

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // check whether the event is created by the current user
    const isEventOwner = event.created_by === String(req.user.id);
    
    // 获取创建者的用户信息
    let creatorInfo = null;
    try {
      if (event.created_by) {
        creatorInfo = await prisma.user.findUnique({
          where: { id: parseInt(event.created_by) },
          select: { username: true }
        });
      }
    } catch (err) {
      console.error("Error fetching creator info:", err);
    }

    res.status(200).json({
      success: true,
      message: 'Event fetched successfully',
      event: {
        ...event,
        creator: creatorInfo
      },
      isEventOwner
    });
  } catch (err) {
    next(err);
  }
};

// Update Event
export const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    date, 
    location, 
    tagIds = [], 
    donors = [],
    status,
    donor_count
  } = req.body;

  try {

    await prisma.donorEvent.deleteMany({
      where: { event_id: id }
    });

  
    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined,
        location,
        status,
        donor_count,
        tags: {
          set: tagIds.map((tagId) => ({ id: tagId })),
        },
        donors: {
          create: donors.map((d) => ({
            donor: { connect: { id: d.donorId } },
            status: d.status || "invited",
          })),
        },
      },
      include: {
        tags: true,
        donors: {
          include: { donor: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (err) {
    next(err);
  }
};

// Soft Delete Event
export const deleteEvent = async (req, res, next) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      event,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEventInfo = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, date, location, status, tagIds = [], donor_count } = req.body;

  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined,
        location,
        status,
        donor_count,
        tags: {
          set: tagIds.map((tagId) => ({ id: tagId })),
        },
      },
      include: { tags: true },
    });

    res.status(200).json({ success: true, message: 'Event info updated', event });
  } catch (err) {
    next(err);
  }
};

export const updateDonorStatus = async (req, res, next) => {
  const { id: event_id } = req.params;
  const { donorId, status } = req.body;

  try {
    const existing = await prisma.donorEvent.findUnique({
      where: { donor_id_event_id: { donor_id: donorId, event_id } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Donor not part of this event' });
    }

    const updatesToEvent = { status };
    const updatesToDonor = {};

    if (!existing.counted_invitation && (status === 'invited' || status === 'confirmed')) {
      updatesToEvent.counted_invitation = true;
      updatesToDonor.total_invitations = { increment: 1 };
    }

    if (!existing.counted_attendance && status === 'attended') {
      updatesToEvent.counted_attendance = true;
      updatesToDonor.total_attendance = { increment: 1 };
    }

    await prisma.$transaction([
      prisma.donorEvent.update({
        where: { donor_id_event_id: { donor_id: donorId, event_id } },
        data: updatesToEvent,
      }),
      Object.keys(updatesToDonor).length > 0
        ? prisma.donor.update({ where: { id: donorId }, data: updatesToDonor })
        : undefined,
    ].filter(Boolean));

    res.status(200).json({ success: true, message: 'Donor status updated' });
  } catch (err) {
    next(err);
  }
};

export const addOrRemoveDonors = async (req, res, next) => {
  const { id: event_id } = req.params;
  const { donors = [] } = req.body; // [{ donorId, action: 'add' | 'remove', status }]

  try {
    await prisma.$transaction(async (tx) => {
      for (const d of donors) {
        const { donorId, action, status } = d;

        if (action === 'remove') {
          await tx.donorEvent.delete({
            where: { donor_id_event_id: { donor_id: donorId, event_id } },
          });
        }

        if (action === 'add') {
          await tx.donorEvent.create({
            data: {
              donor_id: donorId,
              event_id,
              status: status || 'invited',
              counted_invitation: status === 'invited' || status === 'confirmed',
              counted_attendance: status === 'attended',
            },
          });

          const updates = {};
          if (status === 'invited' || status === 'confirmed') updates.total_invitations = { increment: 1 };
          if (status === 'attended') updates.total_attendance = { increment: 1 };

          if (Object.keys(updates).length > 0) {
            await tx.donor.update({ where: { id: donorId }, data: updates });
          }
        }
      }
    });

    res.status(200).json({ success: true, message: 'Donors updated' });
  } catch (err) {
    next(err);
  }
};
