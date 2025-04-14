import express from 'express';
import { verifyToken, verifyEventOwnership } from '../utils/verifyUser.js';
import {
  createEventWithDonors,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventInfo,
  updateDonorStatus,
  addOrRemoveDonors,
  addCollaborator,
  getCollaborators,
  removeCollaborator,
  } from '../controllers/event.controller.js';

const router = express.Router();

router.post('/', verifyToken, createEventWithDonors);
router.get('/', verifyToken, getEvents);
router.get('/:id', verifyToken, getEventById);
router.put('/:id', verifyToken, verifyEventOwnership, updateEvent);
router.delete('/:id', verifyToken, verifyEventOwnership, deleteEvent);

router.patch('/:id/info', verifyToken, verifyEventOwnership, updateEventInfo);
router.patch('/:id/donor-status', verifyToken, verifyEventOwnership, updateDonorStatus);
router.patch('/:id/edit-donors', verifyToken, verifyEventOwnership, addOrRemoveDonors);
router.post('/:id/add-collaborator', verifyToken, verifyEventOwnership, addCollaborator);
router.get('/:id/collaborators', verifyToken, getCollaborators);
router.delete(
  '/:id/collaborators/:userId',
  verifyToken,
  verifyEventOwnership,
  removeCollaborator
);

export default router;
