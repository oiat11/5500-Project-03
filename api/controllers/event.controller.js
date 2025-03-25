// eventController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createEventWithDonors = async (req, res, next) => {
  const { name, description, date, location, tagIds, donors } = req.body;

  // donors: [{ donorId: 'uuid...', status: 'invited' }, ...]

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
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

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};



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

    res.json(events);
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, date, location, tagIds } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined,
        location,
        tags: {
          set: tagIds?.map((id) => ({ id })) || [],
        },
      },
      include: { tags: true },
    });

    res.json(updatedEvent);
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedEvent = await prisma.event.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    res.json({ message: 'Event soft deleted', event: deletedEvent });
  } catch (err) {
    next(err);
  }
};
