import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
    createEventWithDonors,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
  } from '../controllers/event.controller.js';

const router = express.Router();

router.post('/', verifyToken, createEventWithDonors);
router.get('/', verifyToken, getEvents);
router.get('/:id', verifyToken, getEventById);
router.put('/:id', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);

export default router;
