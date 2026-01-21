import { prisma } from "../lib/prisma.js";

/**
 * * FIND ACTIVE RECORD: Finds a record by ID to ensure it hasn't been deleted.
 * @param {number|string} id
 * @param {object} include - Prisma include object (optional)
 * @returns {object} Record
 */
export const findActiveRecord = async (id, include = {}) => {
  return await prisma.disbursement.findFirst({
    where: {
      id: Number(id),
      deletedAt: null,
    },
    include: include,
  });
};
