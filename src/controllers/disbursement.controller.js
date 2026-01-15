import { prisma } from "../lib/prisma.js";

/**
 * * STORE RECORD:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const storeRec = async (req, res) => {
  // TODO: Add user logging

  const {
    //* References
    payeeId,
    fundsourceId,

    //* Documents
    lddapNum,
    orsNum,
    dvNum,
    uacsCode,
    respCode,

    //* Time
    dateReceived,

    //* Financial
    grossAmount,

    //* Details
    particulars,
    method,
    ageLimit,

    //* Items
    items = [],
    deductions = [],
  } = req.body;

  try {
    //* Validation
    if (!payeeId || !fundsourceId) {
      return res
        .status(400)
        .json({ message: "Payee and Fund Source are required." });
    }

    if (!grossAmount) {
      return res.status(400).json({ message: "Gross amount requried" });
    }

    if (!method) {
      return res
        .status(400)
        .json({ message: "Disbursement method is required." });
    }

    //* Calculations
    // Sum up items for Gross Amount
    const calculatedGross = items.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);

    // Sum up deductions
    const calculatedDeductions = deductions.reduce((sum, ded) => {
      return sum + Number(ded.amount || 0);
    }, 0);

    // Calculate net amount
    const calculatedNet = calculatedGross - calculatedDeductions;

    //* Create disbursement
    const newDisbursement = await prisma.disbursement.create({
      data: {
        // FKs
        payeeId: Number(payeeId),
        fundSourceId: Number(fundsourceId),

        // Document Details
        lddapNum,
        orsNum,
        dvNum,
        uacsCode,
        respCode,
        particulars,
        method,
        ageLimit: ageLimit ? Number(ageLimit) : 5,
        dateReceived: dateReceived ? new Date(dateReceived) : null,

        // Financials (Calculated above)
        grossAmount: calculatedGross,
        totalDeductions: calculatedDeductions,
        netAmount: calculatedNet,

        // NESTED WRITES: Create relations automatically
        items: {
          create: items.map((item) => ({
            description: item.description,
            accountCode: item.accountCode,
            amount: Number(item.amount),
          })),
        },
        deductions: {
          create: deductions.map((ded) => ({
            deductionType: ded.deductionType,
            amount: Number(ded.amount),
          })),
        },
      },
      include: {
        items: true,
        deductions: true,
      },
    });

    res.status(201).json(newDisbursement);
  } catch (error) {
    console.log("Error in the storeRec controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * DISPLAY RECORD: Display disbursement records for dashboard
 * Shows disbursement date received, payee, fund, net amount, and status
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const displayRec = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    //* Get disbursement records

    const [totalRecords, records] = await prisma.$transaction([
      prisma.disbursement.count(),
      prisma.disbursement.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          dateReceived: "desc",
        },
        select: {
          id: true,
          dateReceived: true,
          netAmount: true,
          status: true,

          payee: {
            select: {
              name: true,
            },
          },
          fundSource: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      data: records,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        limit,
      },
    });
  } catch (error) {
    console.log("Error in the displayRec controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * SHOW RECORD: Show all data in one disbursement, accessed by view disbursement function in dashboard.
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const showRec = async (req, res) => {
  const { id } = req.params;

  try {
    //* Validation
    if (!id) {
      return res.status(400).json({ message: "Disbursement ID is required." });
    }

    //* Get record
    const record = await prisma.disbursement.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        items: true,
        deductions: true,
        payee: true,
        fundSource: { select: { code: true, name: true, description: true } },
      },
    });

    //* Handle non-existent records
    if (!record) {
      return res.status(404).json({ messaage: "Record not found." });
    }

    res.status(200).json(record);
  } catch (error) {
    console.log("Error in showRec controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * EDIT RECORD: Edit a record's reference codes, fund source and payee
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const editRec = async (req, res) => {
  const { id } = req.params;
  const {
    //* References (The most common edits)
    payeeId,
    fundSourceId,
    lddapNum,
    orsNum,
    dvNum,
    uacsCode,
    respCode,
    particulars,
    method,
    dateReceived,
    ageLimit,

    //* Financials (Optional - only if correcting amounts)
    items,
    deductions,
  } = req.body;

  try {
    //* Validation
    const currentRecord = await prisma.disbursement.findUnique({
      where: { id: Number(id) },
      include: { items: true, deductions: true },
    });

    if (!currentRecord) {
      return res.status(404).json({ message: "Disbursement not found." });
    }

    //* Prevent editing if already approved/released
    if (currentRecord.status !== "pending") {
      return res.status(403).json({
        message: `Cannot edit record. Current status is ${currentRecord.status}.`,
      });
    }

    //* Prepare update object
    const updateData = {
      payeeId: payeeId ? Number(payeeId) : undefined,
      fundSourceId: fundSourceId ? Number(fundSourceId) : undefined,
      lddapNum,
      orsNum,
      dvNum,
      uacsCode,
      respCode,
      particulars,
      method,
      ageLimit: ageLimit ? Number(ageLimit) : undefined,
      dateReceived: dateReceived ? new Date(dateReceived) : undefined,
    };

    //* Recalculations
    let newGross = Number(currentRecord.grossAmount);
    let newTotalDeductions = Number(currentRecord.totalDeductions);

    //* Handle items
    if (items && Array.isArray(items)) {
      // Calculate new Gross from the INCOMING items
      newGross = items.reduce((sum, item) => sum + Number(item.amount), 0);

      // Add Prisma instruction to replace items
      updateData.items = {
        deleteMany: {}, // Remove ALL old items for this ID
        create: items.map((item) => ({
          description: item.description,
          accountCode: item.accountCode,
          amount: Number(item.amount),
        })),
      };

      updateData.grossAmount = newGross;
    }

    //* Handle deductions
    if (deductions && Array.isArray(deductions)) {
      // Calculate new Deductions from the INCOMING array
      newTotalDeductions = deductions.reduce(
        (sum, ded) => sum + Number(ded.amount),
        0
      );

      // Add Prisma instruction to replace deductions
      updateData.deductions = {
        deleteMany: {}, // Remove ALL old deductions
        create: deductions.map((ded) => ({
          deductionType: ded.deductionType,
          amount: Number(ded.amount),
        })),
      };

      updateData.totalDeductions = newTotalDeductions;
    }

    //* Recalculation
    if (items || deductions) {
      updateData.netAmount = newGross - newTotalDeductions;
    }

    //* Execute update
    const updatedRecord = await prisma.disbursement.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        items: true,
        deductions: true,
      },
    });

    res.status(200).json(updatedRecord);
  } catch (error) {
    console.log("Error in editRec controller: ", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * * APPROVE RECORD
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const approveRec = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const userId = req.user?.id;

  try {
    //* Validation
    if (!id) {
      return res.status(400).json({ message: "Disbursement ID is required." });
    }

    //* Check status and get record details for logging
    const record = await prisma.disbursement.findUnique({
      where: { id: Number(id) },
      include: {
        payee: { select: { name: true } },
        fundSource: { select: { code: true, name: true } },
      },
    });

    if (!record) {
      return res.status(404).json({ message: "Disbursement not found." });
    }

    //* Status check
    if (record.status === "approved") {
      return res.status(409).json({ message: "Record is already approved." });
    }

    //* Use transaction with logging
    const result = await prisma.$transaction(async (tx) => {
      //* 1. Update disbursement status
      const approvedRecord = await tx.disbursement.update({
        where: { id: Number(id) },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
        include: {
          payee: { select: { name: true } },
          fundSource: { select: { code: true, name: true } },
          items: true,
          deductions: true,
        },
      });

      //* 2. Create audit log
      if (userId) {
        const logMessage = `APPROVED Disbursement #${id} | Payee: ${record.payee?.name || "N/A"} | Fund: ${record.fundSource?.code || "N/A"} | Net Amount: ₱${Number(record.netAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}${remarks ? ` | Remarks: ${remarks}` : ""}`;

        await tx.logs.create({
          data: {
            userId: userId,
            log: logMessage,
          },
        });
      }

      return approvedRecord;
    });

    //* Return
    res.status(200).json({
      message: "Disbursement approved successfully.",
      data: result,
    });
  } catch (error) {
    console.log("Error in approveRec controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * * REMOVE RECORD:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const removeRec = async (req, res) => {
  return res.status(200).json({ message: "Show  Disbursement" });
};
