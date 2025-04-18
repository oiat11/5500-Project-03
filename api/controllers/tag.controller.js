import { PrismaClient } from "@prisma/client";
import { errorHandler } from "../utils/error.js";

const prisma = new PrismaClient();

// Create Tag
export const createTag = async (req, res, next) => {
  const { name, description, color } = req.body;

  try {
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return next(errorHandler(400, "A tag with this name already exists."));
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        description,
        color,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    next(error);
  }
};

// Get all Tags
export const getTags = async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { is_deleted: false },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Tags fetched successfully",
      tags,
    });
  } catch (error) {
    next(error);
  }
};

// Update Tag
export const updateTag = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, color } = req.body;

  try {
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag || existingTag.is_deleted) {
      return next(errorHandler(404, "Tag not found."));
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name, description, color },
    });

    res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      tag: updatedTag,
    });
  } catch (error) {
    next(error);
  }
};

// Soft Delete Tag
export const deleteTag = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag || existingTag.is_deleted) {
      return next(errorHandler(404, "Tag not found."));
    }

    const deletedTag = await prisma.tag.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
      tag: deletedTag,
    });
  } catch (error) {
    next(error);
  }
};
