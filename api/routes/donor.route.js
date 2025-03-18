import express from 'express';
import { createDonor } from '../controllers/donor.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, createDonor);

export default router;
