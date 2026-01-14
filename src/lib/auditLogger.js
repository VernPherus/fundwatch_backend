import { prisma } from "./prisma.js";

/**
 * *AUDIT LOGGER: Create an audit log entry
 * @param {Object} tx - The Prisma Transaction Client (or standard prisma client)
 * @param {number} userId - The ID of the user performing the action
 * @param {string} message - The readable log message
 */
export const createLog = async (tx, userId, message) => {
  if (!userId) {
    console.warn("Audit Log Warning: No User ID provided for log: " + message);
    return;
  }

  await tx.logs.create({
    data: {
      userId: Number(userId),
      log: message,
    },
  });
};
