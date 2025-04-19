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

// Hard Delete Tag and Related Donor Associations
export const deleteTag = async (req, res, next) => {
  const { id } = req.params;

  try {
    // 检查 tag 是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found.",
      });
    }

    // 删除所有 DonorTag 中的关联（中间表记录）
    await prisma.donorTag.deleteMany({
      where: {
        tag_id: id,
      },
    });

    // 硬删除 tag 本体
    await prisma.tag.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Tag and all related donor associations permanently deleted.",
    });
  } catch (error) {
    console.error("Error in deleteTag:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
