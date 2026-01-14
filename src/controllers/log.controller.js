import { prisma } from "../lib/prisma.js";

/**
 * * GET SYSTEM LOGS: Display system logs for admin dashboard
 * @param {*} req
 * @param {*} res
 */
export const getSystemLogs = async (req, res) => {
  const page = Number;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const [total, logs] = await prisma.$transaction([
      prisma.logs.count(),
      prisma.logs.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { username: true, email: true, role: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      data: logs,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log("Error in getSystemLogs controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};
