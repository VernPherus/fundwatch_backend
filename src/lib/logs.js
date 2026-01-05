import { prisma } from "../lib/prisma.js";

export const logAction = async (userId, logMessage) => {
  await prisma.logs.create({
    data: {
      userId: userId,
      log: logMessage,
    },
  });
};
