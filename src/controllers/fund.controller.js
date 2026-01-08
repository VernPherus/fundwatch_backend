import { prisma } from "../lib/prisma.js";

// TODO: function for calculating current fund amount 

/**
 * * NEW FUND: Create fund source
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const newFund = async (req, res) => {
  // TODO: Add logging
  const { code, name, initialBalance, description } = req.body;

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
    const savedFund = await prisma.fundSource.create({
      data: {
        code,
        name,
        initialBalance: initialBalance || 0,
        description,
      },
    });

    res.status(201).json({ message: "New fund created.", savedFund });
  } catch (error) {
    console.log("Error in newFund controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * * DISPLAY FUND:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const displayFund = async (req, res) => {
  try {
    //* Get funds
    const funds = await prisma.fundSource.findMany();

    res.status(200).json(funds);
  } catch (error) {
    console.log("Error in displayFund controller: ", error.message);
    res.status(400).json({ message: "Internal server error." });
  }
};

/**
 * * SHOW FUND:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const showFund = async (req, res) => {
  const { id: fundID } = req.params;

  try {
    const fund = await prisma.fund.findUnique({
      where: {
        id: fundID,
      },
    });

    res.status(200).json({ fund });
  } catch (error) {
    console.log("Error in showFund controller: " + error.message);
    res.status(500).json({ message: "Internal server error." });
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
  return res.status(200).json({ message: "Deactivated fund" });
};
