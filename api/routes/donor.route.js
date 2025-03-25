import express from 'express';
import multer from 'multer';
import { createDonor, getDonors, getAllDonors, getDonorById, updateDonor, deleteDonor, importDonorsCsv } from '../controllers/donor.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Create donor
router.post('/', verifyToken, createDonor);



// Get all donors with search and pagination
router.get('/', verifyToken, getDonors);

// Get all donors without any filters
router.get('/all', verifyToken, getAllDonors);

// Get donor by ID
router.get('/:id', verifyToken, getDonorById);

// Update donor
router.put('/:id', verifyToken, updateDonor);

// Delete donor
router.delete('/:id', verifyToken, deleteDonor);

// Import donors from CSV file
router.post('/import/csv', verifyToken, upload.single('file'), importDonorsCsv);

export default router;
