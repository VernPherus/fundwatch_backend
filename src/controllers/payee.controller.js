import { prisma } from "../lib/prisma.js";
import { createLog } from "../lib/auditLogger.js";

/**
 * * NEW PAYEE: Create payee source
 * @param {object} req
 * @param {object} res
 * @returns
 */
export const newPayee = async (req, res) => {
  const {
    name,
    address,
    type,
    tinNum,
    bankName,
    bankBranch,
    accountName,
    accountNumber,
    contactPerson,
    mobileNum,
    email,
    remarks,
  } = req.body;

  const userId = req.user?.id;

  try {
    //* Validation
    if (!name || !type || !mobileNum) {
      return res
        .status(400)
        .json({ message: "Name, type, and mobileNum are required fields." });
    }

    //* Check for duplications
    const existingPayee = await prisma.payee.findFirst({
      where: { name: name },
    });

    if (existingPayee) {
      return res
        .status(409)
        .json({ message: "A payee with this name already exists" });
    }

    // Transaction
    const savedPayee = await prisma.$transaction(async (tx) => {
      // Create new payee
      const payee = await tx.payee.create({
        data: {
          name,
          address,
          type,
          tinNum,
          bankName,
          bankBranch,
          accountName,
          accountNumber,
          contactPerson,
          mobileNum,
          email,
          remarks,
          isActive: true,
        },
      });

      // Create log
      await createLog(
        tx,
        userId,
        `Created new Payee: ${payee.name} (${payee.type || "Unspecified"})`,
      );
    });

    res.status(201).json({ message: "New payee created", savedPayee });
  } catch (error) {
    console.log("Error in newPayee controller: " + error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * LIST PAYEE: Displays payee for disbursement form
 * @param {*} res
 * @returns
 */
export const listPayee = async (res) => {
  try {
    // Get payee:
    const payees = await prisma.payee.findMany();

    res.status(200).json(payees);
  } catch (error) {
    console.log("Error in displayPayee controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * SHOW PAYEE: Displays details for payee
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const showPayee = async (req, res) => {
  const { id: payeeID } = req.params;
  try {
    const payee = await prisma.payee.findUnique({
      where: {
        id: payeeID,
      },
    });

    res.status(200).json({ payee });
  } catch (error) {
    console.log("Error in showPayee controller: " + error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * EDIT PAYEE: Edit all payee details
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const editPayee = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    address,
    type,
    tinNum,
    bankName,
    bankBranch,
    accountName,
    accountNumber,
    contactPerson,
    mobileNum,
    email,
    remarks,
    isActive,
  } = req.body;

  const userId = req.user?.id;

  try {
    //* Validation
    if (!id) {
      return res.status(400).json({ message: "Payee ID is required." });
    }

    const currentPayee = await prisma.payee.findUnique({
      where: { id: Number(id) },
    });

    if (!currentPayee) {
      return res.status(404).json({ message: "Payee not found." });
    }

    // Check for duplicates
    if (name && name !== currentPayee.name) {
      const duplicate = await prisma.payee.findFirst({
        where: { name: name },
      });
      if (duplicate) {
        return res
          .status(409)
          .json({ message: "Another payee with this name already exists." });
      }
    }

    // Transaction
    const updatedPayee = await prisma.$transaction(async (tx) => {
      // Update
      const payee = await tx.payee.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          address,
          type,
          tinNum,
          bankName,
          bankBranch,
          accountName,
          accountNumber,
          contactPerson,
          mobileNumber: mobileNum,
          email,
          remarks,
          isActive,
        },
      });

      // Create log
      const statusNote =
        isActive !== undefined && isActive !== currentPayee.isActive
          ? ` (Status changed to ${isActive ? "Active" : "Inactive"})`
          : "";

      const nameNote =
        name && name !== currentPayee.name
          ? ` (Renamed from ${currentPayee.name})`
          : "";

      await createLog(
        tx,
        userId,
        `Updated Payee: ${payee.name}${nameNote}${statusNote}`,
      );
    });

    res.status(200).json({ updatedPayee });
  } catch (error) {
    console.log("Error in the editPayee controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * REMOVE PAYEE: Deactivates the active status of the payee
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const removePayee = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Validation
    const payeeToCheck = await prisma.payee.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        deletedAt: true,
      },
    });

    if (!payeeToCheck) {
      return res.status(404).json({ message: "Payee not found." });
    }

    if (payeeToCheck.deletedAt) {
      return res.status(400).json({ message: "Payee is already removed." });
    }

    // Transaction
    await prisma.$transaction(async (tx) => {
      // Soft delete operation
      await tx.payee.update({
        where: { id: Number(id) },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      // Create log
      await createLog(tx, userId, `Removed Payee: ${payeeToCheck.name}`);
    });
  } catch (error) {
    console.log("Error in the removePayee controller: " + error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
