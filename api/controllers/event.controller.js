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
          include: { donor: true },
        },
      },
    });

    if (!event || event.is_deleted) {
      return next(errorHandler(404, 'Event not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Event fetched successfully',
      event,
    });
  } catch (err) {
    next(err);
  }
};

// Update Event
export const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, date, location, tagIds = [] } = req.body;

  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined,
        location,
        tags: {
          set: tagIds.map((id) => ({ id })),
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
