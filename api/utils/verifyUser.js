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
    
    if (event.created_by !== String(req.user.id)) {
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
