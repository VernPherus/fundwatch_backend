import { prisma } from "../lib/prisma.js";
import { createLog } from "../lib/auditLogger.js";
import { Reset, Status } from "../lib/constants.js";
import { count } from "console";

// TODO: function for calculating current fund amount

/**
 * * NEW FUND: Create fund source
 * @param {object} req
 * @param {object} res
 * @returns
 */
export const newFund = async (req, res) => {
  const { code, name, initialBalance, description, reset } = req.body;
  const userId = req.user?.id;

  try {
    //* Validation
    if (!code || !name) {
      return res
        .status(400)
        .json({ message: "Fund Code and Name are required." });
    }

    //* Check for duplicates
    const existingFund = await prisma.fundSource.findUnique({
      where: { code: code },
    });

    if (existingFund) {
      return res.status(409).json({ message: "Fund code already exists" });
    }

    //* Create fund source
    const savedFund = await prisma.$transaction(async (tx) => {
      // Create fund
      const fund = await tx.fundSource.create({
        data: {
          code,
          name,
          initialBalance: initialBalance || 0,
          description,
          reset: reset || Reset.NONE,
        },
      });

      // Create log
      await createLog(
        tx,
        userId,
        `Create new Fund Source: ${fund.code} - ${fund.name}`,
      );

      return fund;
    });
    res.status(201).json({ message: "New fund created.", savedFund });
  } catch (error) {
    console.log("Error in newFund controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * * NEW ENTRY
 * @param {*} req
 * @param {*} res
 */
export const newEntry = async (req, res) => {
  const { sourceId, name, amount } = req.body;
  const userId = req.user?.id;

  try {
    // Validation
    if (!sourceId || !name || !amount) {
      return res.status(500).json({ message: "All fields required" });
    }

    // Create entry
    const newEntry = await prisma.$transaction(async (tx) => {
      const fund = await tx.fundSource.findUnique({
        where: { id: Number(sourceId) },
        select: { code: true },
      });

      if (!fund) {
        throw new Error("Fund source not found");
      }
      // Create entry
      const entry = await tx.fundEntry.create({
        data: {
          fundSource: Number(sourceId),
          name: name,
          amount: Number(amount),
        },
        include: {
          fundSource: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      // Create log
      await createLog(
        tx,
        userId,
        `Added allocation entry "${entry.name}" (${entry.amount}) to fund ${entry.fundSource?.code}`,
      );

      return entry;
    });

    res.status(201).json({
      message: "New fund entry created successfully",
      data: newEntry,
    });
  } catch (error) {
    console.log("Error in newEntry controller: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * * DISPLAY FUND: Displays all disbusrements
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const displayFund = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    // Dynamic Where Clause for Search
    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Transaction to get count and data efficiently
    const [totalRecords, funds] = await prisma.$transaction([
      prisma.fundSource.count({ where }),
      prisma.fundSource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: "asc" },
        include: {
          // Optional: Include disbursement count for UI cues
          _count: { select: { disbursements: true } },
        },
      }),
    ]);

    res.status(200).json({
      data: funds,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        limit,
      },
    });
  } catch (error) {
    console.log("Error in displayFund controller: ", error.message);
    res.status(400).json({ message: "Internal server error." });
  }
};

/**
 * * DISPLAY FUND DASHBOARD: Displays the total amount of each disbursement, a total amount of all disbnursements combined, this is for a card display in the dashboard
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const displayFundDashboard = async (req, res) => {
  try {
    // Fetch active funds
    const funds = await prisma.fundSource.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        initialBalance: true,
        disbursements: {
          where: { status: Status.PAID },
          select: { netAmount: true },
        },
      },
    });

    // Calculate individual fund stats
    const fundStats = funds.map((fund) => {
      const totalSpent = fund.disbursements.reduce(
        (sum, d) => sum + Number(d.netAmount),
        0,
      );
      const initialBalance = Number(fund.initialBalance);
      const remaining = initializeBalance - totalSpent;

      // Calculate percentage used
      const utilization =
        initialBalance > 0
          ? ((totalSpent / initialBalance) * 100).toFixed(1)
          : 0;

      return {
        id: fund.id,
        code: fund.code,
        name: fund.name,
        initialBalance,
        totalSpent,
        remaining,
        utilizationRate: Number(utilization),
      };
    });

    const globalTotals = fundsStats.reduce(
      (acc, curr) => ({
        totalBudget: acc.totalBudget + curr.initialBalance,
        totalSpent: acc.totalSpent + curr.totalSpent,
        totalRemaining: acc.totalRemaining + curr.remaining,
      }),
      { totalBudget: 0, totalSpent: 0, totalRemaining: 0 },
    );

    res.status(200).json({
      funds: fundStats,
      totals: globalTotals,
    });
  } catch (error) {
    console.log(
      "Error in the displayFundDashbaord controller: " + error.message,
    );
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * DISPLAY ENTRY: Displays all entries
 * @param {object} req
 * @param {object} res
 */
export const displayEntry = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { fundId } = req.query;

  try {
    // Filter by specific fund if provided
    const where = fundId ? { fundSourceId: Number(fundId) } : {};

    const [totalRecords, entries] = await prisma.$transaction([
      prisma.fundEntry.count({ where }),
      prisma.fundEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          fundSource: {
            select: { code: true, name: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      data: entries,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        limit,
      },
    });
  } catch (error) {
    console.log("Error in the resetFund controller: " + error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * SHOW FUND
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const showFund = async (req, res) => {
  const { id: fundID } = req.params;

  try {
    // Fetch fund entries with paid disbursements
    const fund = await prisma.fund.findUnique({
      where: {
        id: Number(fundID),
      },
      include: {
        fundEntries: true,
        disbursement: {
          where: { status: Status.PAID },
          select: { netAmount: true },
        },
        _count: {
          select: { disbursement: true },
        },
      },
    });

    if (!fund) {
      return res.status(404).json({ message: "Fund source not found." });
    }

    // Calculations
    const totalSpent = fund.disbursements.reduce(
      (sum, record) => sum + Number(record.netAmount),
      0,
    );
    const initialBalance = Number(fund.initialBalance);
    const remainingBalance = initialBalance - totalSpent;

    // Format response
    const { disbursements, ...fundData } = fund;

    res.status(200).json({
      ...fundData,
      stats: {
        initialBalance,
        remainingBalance,
        utilizationRate:
          initialBalance > 0
            ? ((totalSpent / initialBalance) * 100).toFixed(1)
            : 0,
      },
    });
  } catch (error) {
    console.log("Error in showFund controller: " + error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * RESET FUND:
 * @param {*} req
 * @param {*} res
 */
export const resetFund = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in the resetFund controller: " + error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * EDIT FUND:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const editFund = async (req, res) => {
  // TODO: add logging
  const { id } = req.params;
  const { code, name, initialBalance, description } = req.body;

  try {
    //* Validation
    if (!id) {
      return res.status(400).json({ message: "Fund ID is required." });
    }

    //* Update fund:
    const updatedFundSource = await prisma.fundSource.update({
      where: {
        id: Number(id),
      },
      data: {
        code,
        name,
        initialBalance,
        description,
      },
    });

    res.status(200).json({ message: "Fund updated", updatedFundSource });
  } catch (error) {
    console.log("Error in the editFund controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * DEACTIVATE FUND:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const deactivateFund = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in deactivateFund controller: " + error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * DELETE
 * @param {*} req
 * @param {*} res
 */
export const deleteEntry = async (req, res) => {
  const { entryId } = req.params;

  try {
  } catch (error) {
    console.log("Error in the deleteEntry controller: " + error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
