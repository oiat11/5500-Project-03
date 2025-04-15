import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const recordEditHistory = async ({
  event_id,
  editor_id,
  edit_type,
  old_value = null,
  new_value = null,
}) => {
  try {
    await prisma.eventEditHistory.create({
      data: {
        event_id,
        editor_id,
        edit_type,
        old_value,
        new_value,
      },
    });
  } catch (err) {
    console.error("Failed to record history:", err);
  }
};
