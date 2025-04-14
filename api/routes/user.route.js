import express from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get("/all", verifyToken, getAllUsers);

export default router;