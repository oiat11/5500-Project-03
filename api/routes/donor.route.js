import express from 'express';
import multer from 'multer';
import { createDonor, getDonors, getAllDonors, getDonorById, updateDonor, deleteDonor, importDonorsCsv, getAvailableCities, recommendDonors } from '../controllers/donor.controller.js';
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

// Get all donors
router.get('/', verifyToken, getDonors);

// Get all donors (without pagination)
router.get('/all', verifyToken, getAllDonors);

// Get available cities
router.get('/cities', verifyToken, getAvailableCities);


// Update donor
router.put('/:id', verifyToken, updateDonor);

// Delete donor
router.delete('/:id', verifyToken, deleteDonor);

// Import donors from CSV file
router.post('/import/csv', verifyToken, upload.single('file'), importDonorsCsv);

// Recommend donors
router.get('/recommend', recommendDonors);

// Get single donor
router.get('/:id', verifyToken, getDonorById);

// Create donor
router.post('/', verifyToken, createDonor);

export default router;
