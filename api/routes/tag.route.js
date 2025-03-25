import express from 'express';
import {
  createTag,
  getTags,
  updateTag,
  deleteTag
} from '../controllers/tag.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router();

router.post('/', verifyToken, createTag);
router.get('/', verifyToken, getTags);
router.patch('/:id', verifyToken, updateTag);
router.delete('/:id', verifyToken, deleteTag);

export default router;
