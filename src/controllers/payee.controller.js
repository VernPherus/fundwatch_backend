import { prisma } from "../lib/prisma.js";

/**
 * * NEW PAYEE: Create payee source
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const newPayee = async (req, res) => {
  // TODO: Add user logs
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
    mobileNumber, // Frontend may send this
    email,
    remarks,
  } = req.body;

  try {
    //* Validation
    if (!name) {
      return res.status(400).json({ message: "Payee name is required." });
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

    //* Create payee
    const savedPayee = await prisma.payee.create({
      data: {
        name,
        address: address || null,
        type: type || "supplier",
        tinNum: tinNum || null,
        bankName: bankName || null,
        bankBranch: bankBranch || null,
        accountName: accountName || null,
        accountNumber: accountNumber || null,
        contactPerson: contactPerson || null,
        mobileNum: mobileNum || mobileNumber || null,
        email: email || null,
        remarks: remarks || null,
      },
    });

    res.status(201).json({ message: "New payee created", savedPayee });
  } catch (error) {
    console.log("Error in newPayee controller: " + error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * LIST PAYEE: Displays payee for disbursement form
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const listPayee = async (req, res) => {
  try {
    // TODO: Add pagination
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

  try {
    //* Validation
    if (!id) {
      return res.status(400).json({ message: "Payee ID is required." });
    }

    const updatedPayee = await prisma.payee.update({
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
  return res.status(200).json({ message: "Deactivated payee" });
};
