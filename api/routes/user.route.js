import express from "express";
import { getAllUsers, searchUsers } from "../controllers/user.controller.js";
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get("/all", verifyToken, getAllUsers);
router.get("/search", verifyToken, searchUsers);

export default router;