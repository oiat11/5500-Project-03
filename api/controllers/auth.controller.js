import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {errorHandler} from "../utils/error.js";

const prisma = new PrismaClient();

export const signUp = async (req, res, next) => {
    const { username, email, password } = req.body;

    const hashedPassword = bcryptjs.hashSync(password, 10); 

    try {
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
