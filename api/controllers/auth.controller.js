import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {errorHandler} from "../utils/error.js";

const prisma = new PrismaClient();

export const signUp = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email already in use. Please use a different email or login." });
        }

        const hashedPassword = bcryptjs.hashSync(password, 10); 

        const newUser = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        next(error);
    }
};

export const logIn = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const validUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!validUser) return next(errorHandler(404, "User not found"));

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, "Wrong credentials"));

        const token = jwt.sign({ id: validUser.id }, process.env.JWT_SECRET, {
            expiresIn: "7d", 
        });

        const { password: pass, ...rest } = validUser;

        res.cookie("access_token", token, { httpOnly: true }).status(200).json(rest);
    } catch (error) {
        next(error);
    }
};
