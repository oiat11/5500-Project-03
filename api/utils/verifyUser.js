import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyToken = (req, res, next) => {
    // get the token from the cookies
    const token = req.cookies.access_token;

    //if token is missing, return an error
    if (!token) {
        return next(errorHandler(401, 'Unauthorized'));
    }

    // verify the token with the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(403, 'Forbidden'));
        }

        // set the user in the request object so it can be accessed in the next middleware
        req.user = user;
        console.log(user);
        next();
    });
};

export const verifyEventOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    if (event.created_by !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this event'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const verifyEventEditor = async (req, res, next) => {
  const { id: eventId } = req.params;
  const userId = req.user?.id;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }, // <-- 使用字符串 ID，不要 parseInt
      include: {
        collaborators: {
          where: { userId },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isOwner = event.created_by === userId;
    const isCollaborator = event.collaborators.length > 0;

    if (isOwner || isCollaborator) {
      return next();
    }

    return res.status(403).json({ message: "You are not allowed to edit this event." });
  } catch (err) {
    return next(err);
  }
};