import express from 'express';
import { createDonor, getDonors, getDonorById } from '../controllers/donor.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Create donor
router.post('/', verifyToken, createDonor);

// Get all donors with search and pagination
router.get('/', verifyToken, getDonors);

// Get donor by ID
router.get('/:id', verifyToken, getDonorById);

export default router;
