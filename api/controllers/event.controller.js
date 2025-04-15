import { PrismaClient } from '@prisma/client';
import { errorHandler } from '../utils/error.js';
import { recordEditHistory } from '../utils/history.js';

const prisma = new PrismaClient();

export const createEventWithDonors = async (req, res, next) => {
  const { name, description, date, location, tagIds = [], donors = [], status, capacity } = req.body;

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: date ? new Date(date) : null,
        location,
        status,
        capacity: capacity ? parseInt(capacity) : null,
        created_by: req.user.id,
        donors: {
          create: donors.map((d) => ({
            donor: { connect: { id: d.donorId } },
            status: d.status,
          })),
        },
      },
      include: {
        donors: {
          include: { donor: true },
        },
      },
    });

    // ✅ 非事务方式记录历史
    recordEditHistory({
      event_id: event.id,
      editor_id: req.user.id,
      edit_type: 'event_created',
      new_value: name,
    });

    if (donors.length > 0) {
      recordEditHistory({
        event_id: event.id,
        editor_id: req.user.id,
        edit_type: 'donor_initialized',
        new_value: `${donors.length} donors`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
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
          include: {
            donor: true,
          },
        },
        createdBy: {
          select: {
            username: true,
            avatar: true
          },
        },
      },
      orderBy: { date: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
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
                  include: { tag: true },
                },
              },
            },
          },
        },
        createdBy: {
          select: {
            username: true,
            avatar: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isEventOwner = req.user?.id === event.created_by;

    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      event,
      isEventOwner,
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
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    const editorId = req.user?.id;

    const track = (field, newValue) => {
      if (newValue !== undefined && newValue?.toString() !== existing[field]?.toString()) {
        recordEditHistory({
          event_id: id,
          editor_id: editorId,
          edit_type: `${field}_updated`,
          old_value: existing[field]?.toString() || null,
          new_value: newValue?.toString() || null,
        });
      }
    };

    track('name', name);
    track('description', description);
    track('location', location);
    track('status', status);
    track('date', date);
    track('donor_count', donor_count);

    for (const tagId of tagIds) {
      recordEditHistory({
        event_id: id,
        editor_id: editorId,
        edit_type: 'tag_updated',
        new_value: tagId,
      });
    }

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

    let previousStatus = existing.status;
    let updatesToEvent = { status };
    let updatesToDonor = {};

    if (!existing.counted_invitation && (status === 'invited' || status === 'confirmed')) {
      updatesToEvent.counted_invitation = true;
      updatesToDonor.total_invitations = { increment: 1 };
    }

    if (!existing.counted_attendance && status === 'attended') {
      updatesToEvent.counted_attendance = true;
      updatesToDonor.total_attendance = { increment: 1 };
    }

    await prisma.$transaction(async (tx) => {
      await tx.donorEvent.update({
        where: { donor_id_event_id: { donor_id: donorId, event_id } },
        data: updatesToEvent,
      });

      if (Object.keys(updatesToDonor).length > 0) {
        await tx.donor.update({ where: { id: donorId }, data: updatesToDonor });
      }
    });

    recordEditHistory({
      event_id,
      editor_id: req.user.id,
      edit_type: 'donor_status_updated',
      old_value: previousStatus,
      new_value: status,
    });

    res.status(200).json({ success: true, message: 'Donor status updated' });
  } catch (err) {
    next(err);
  }
};

export const addOrRemoveDonors = async (req, res, next) => {
  const { id: event_id } = req.params;
  const { donors = [] } = req.body;

  let addedCount = 0;
  let removedCount = 0;

  try {
    for (const d of donors) {
      const { donorId, action, status } = d;

      if (action === 'remove') {
        await prisma.donorEvent.delete({
          where: { donor_id_event_id: { donor_id: donorId, event_id } },
        });
        removedCount++;
      }

      if (action === 'add') {
        await prisma.donorEvent.create({
          data: {
            donor_id: donorId,
            event_id,
            status: status || 'invited',
            counted_invitation: status === 'invited' || status === 'confirmed',
            counted_attendance: status === 'attended',
          },
        });
        addedCount++;

        const updates = {};
        if (status === 'invited' || status === 'confirmed') {
          updates.total_invitations = { increment: 1 };
        }
        if (status === 'attended') {
          updates.total_attendance = { increment: 1 };
        }

        if (Object.keys(updates).length > 0) {
          await prisma.donor.update({ where: { id: donorId }, data: updates });
        }
      }
    }

    if (addedCount > 0) {
      recordEditHistory({
        event_id,
        editor_id: req.user.id,
        edit_type: 'donor_added_bulk',
        new_value: `${addedCount} donors added`,
      });
    }

    if (removedCount > 0) {
      recordEditHistory({
        event_id,
        editor_id: req.user.id,
        edit_type: 'donor_removed_bulk',
        old_value: `${removedCount} donors removed`,
      });
    }

    res.status(200).json({ success: true, message: 'Donors updated' });
  } catch (err) {
    next(err);
  }
};


export const getCollaborators = async (req, res, next) => {
  const { id } = req.params;

  try {
    const collaborators = await prisma.eventCollaborator.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      collaborators: collaborators.map((c) => c.user),
    });
  } catch (err) {
    next(err);
  }
};

export const updateCollaborators = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { addIds = [], removeIds = [] } = req.body;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event || event.created_by !== req.user.id) {
      return res.status(403).json({ message: "Only the event owner can update collaborators." });
    }

    if (removeIds.includes(req.user.id) || addIds.includes(req.user.id)) {
      return res.status(400).json({ message: "You cannot add or remove yourself." });
    }

    const added = [];
    const removed = [];

    await prisma.$transaction(async (tx) => {
      for (const userId of addIds) {
        await tx.eventCollaborator.upsert({
          where: { eventId_userId: { eventId, userId } },
          update: {},
          create: { eventId, userId },
        });
        added.push(userId);
      }

      if (removeIds.length > 0) {
        await tx.eventCollaborator.deleteMany({
          where: { eventId, userId: { in: removeIds } },
        });
        removed.push(...removeIds);
      }
    });

    const historyTasks = [];

    for (const userId of added) {
      historyTasks.push(
        recordEditHistory({
          event_id: eventId,
          editor_id: req.user.id,
          edit_type: 'collaborator_added',
          new_value: userId.toString(),
        }).catch((e) => console.warn('History error (add):', e))
      );
    }

    for (const userId of removed) {
      historyTasks.push(
        recordEditHistory({
          event_id: eventId,
          editor_id: req.user.id,
          edit_type: 'collaborator_removed',
          old_value: userId.toString(),
        }).catch((e) => console.warn('History error (remove):', e))
      );
    }

    await Promise.all(historyTasks); 

    res.status(200).json({ message: "Collaborators updated." });
  } catch (err) {
    next(err);
  }
};


export const getEventHistory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const history = await prisma.eventEditHistory.findMany({
      where: { event_id: id },
      orderBy: { created_at: 'desc' },
      include: {
        editor: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event edit history fetched successfully',
      history,
    });
  } catch (err) {
    next(err);
  }
};

