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


export const searchUsers = async (req, res, next) => {

  const { query } = req.query;
  console.log(query);

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search query is required." });
  }

  try {
    const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: query,
              },
            },
            {
              email: {
                contains: query,
              },
            },
          ],
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
        take: 10,
      });
      console.log(users);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
