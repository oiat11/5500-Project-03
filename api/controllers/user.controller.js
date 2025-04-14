import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
    });

    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};
