import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

import {
  Role,
  Method,
  PayeeType,
  LddapMethod,
  Status,
  Reset,
} from "../lib/constants.js";

import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

//* Helper to generate a random date between start and end
function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

//* Helper to get random integer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//* Generate random code for references
const genCode = (prefix) =>
  `${prefix}-${getRandomInt(2024, 2025)}-${getRandomInt(1000, 9999)}`;

async function main() {
  console.log("Starting database seed...");

  //* --- Create Users ---
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fundwatch.com" },
    update: {},
    create: {
      username: "admin_user",
      firstName: "Super",
      lastName: "Admin",
      email: "admin@fundwatch.com",
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "approver@fundwatch.com" },
    update: {},
    create: {
      username: "approver_staff",
      firstName: "Finance",
      lastName: "Manager",
      email: "approver@fundwatch.com",
      password: passwordHash,
      role: Role.STAFF,
    },
  });

  const encoder = await prisma.user.upsert({
    where: { email: "encoder@fundwatch.com" },
    update: {},
    create: {
      username: "encoder_user",
      firstName: "User",
      lastName: "View",
      email: "encoder@fundwatch.com",
      password: passwordHash,
      role: Role.USER,
    },
  });

  console.log("Users created.");

  //* --- Create Fund Sources ---
  const fund1 = await prisma.fundSource.upsert({
    where: { code: "GF-101" },
    update: {},
    create: {
      code: "GF-101",
      name: "Regular Agency Fund",
      description: "General Fund for regular agency operations (PS & MODE)",
      initialBalance: 5000000.0,
      reset: Reset.NONE,
    },
  });

  const fund2 = await prisma.fundSource.upsert({
    where: { code: "F-184" },
    update: {},
    create: {
      code: "F-184",
      name: "MDS Trust Fund",
      initialBalance: 1500000.0,
      reset: Reset.MONTHLY,
      fundEntries: {
        create: [
          {
            name: "NCA - 101",
            amount: 3000000.0,
          },
          { name: "NCA - 102", amount: 2000000.0 },
        ],
      },
    },
  });

  const funds = [fund1, fund2];
  console.log("Fund Sources created.");

  //* --- Create Payees ---
  const payeesData = [
    {
      name: "Acme Office Supplies",
      address: "123 Business St, City Center",
      tinNum: "123-456-789-000",
      bankName: "Landbank",
      accountNumber: "1111-2222-33",
      contactPerson: "John Doe",
      type: PayeeType.SUPPLIER,
    },
    {
      name: "BuildRight Construction",
      address: "45 Industrial Ave, West Sector",
      tinNum: "987-654-321-000",
      bankName: "BDO",
      accountNumber: "5555-6666-77",
      contactPerson: "Jane Smith",
      type: PayeeType.SUPPLIER,
    },
    {
      name: "John Doe",
      address: "99 Utility Road",
      type: PayeeType.EMPLOYEE,
      remarks: "",
    },
    {
      name: "TechSolutions Inc",
      address: "88 Cyberzone, IT Park",
      bankName: "BPI",
      accountNumber: "9988-7766-55",
      type: PayeeType.EMPLOYEE,
    },
  ];

  const payees = [];
  for (const p of payeesData) {
    // Check if exists first to avoid duplicates on re-seed
    const existing = await prisma.payee.findFirst({ where: { name: p.name } });
    if (!existing) {
      const payee = await prisma.payee.create({ data: p });
      payees.push(payee);
    } else {
      payees.push(existing);
    }
  }

  console.log("Payees created.");

  //* Create Disbursements
  // Clean up old disbursements first to avoid clutter during dev
  // await prisma.disbursement.deleteMany({});

  const today = new Date();
  const thisMonth = new Date();
  thisMonth.setDate(1);

  // --- LDDAP Method (10 Items) ---
  console.log("Generating 10 LDDAP Disbursements...");

  for (let i = 1; i <= 10; i++) {
    const randomFund = funds[getRandomInt(0, funds.length - 1)];
    const randomPayee = payees[getRandomInt(0, payees.length - 1)];
    const randomDate = getRandomDate(thisMonth, today);

    // Financials
    const gross = getRandomInt(10000, 50000);
    const tax = gross * 0.05;
    const net = gross - tax;

    // Variation: 50% Online, 50% Manual
    const isOnline = i % 2 === 0;
    const lddapMethod = isOnline ? LddapMethod.ONLINE : LddapMethod.MANUAL;

    const isPaid = true;
    const status = isPaid ? Status.PAID : Status.PENDING;

    await prisma.disbursement.create({
      data: {
        payeeId: randomPayee.id,
        fundSourceId: randomFund.id,

        // --- LDDAP Specific Fields ---
        method: Method.LDDAP,
        lddapMthd: lddapMethod,
        lddapNum: genCode("LDDAP"),
        checkNum: null, // No check num for LDDAP

        // --- Common Fields ---
        dateReceived: randomDate,
        dateEntered: new Date(),
        grossAmount: gross,
        totalDeductions: tax,
        netAmount: net,
        particulars: `Payment for services (LDDAP ${lddapMethod}) - Batch ${i}`,
        status: status,
        approvedAt: isPaid ? new Date() : null,

        // --- Relations: References (New Schema) ---
        references: {
          create: {
            acicNum: genCode("ACIC"),
            orsNum: genCode("ORS"),
            dvNum: genCode("DV"),
            uacsCode: `5-02-${getRandomInt(10, 99)}-${getRandomInt(100, 999)}`,
            respCode: `19-001-03-${getRandomInt(100, 999)}`,
          },
        },

        // --- Relations: Items & Deductions ---
        items: {
          create: [
            {
              description: "Generic Service",
              amount: gross,
              accountCode: "5-02-99-990",
            },
          ],
        },
        deductions: {
          create: [
            {
              deductionType: "Tax (5%)",
              amount: tax.toFixed(2),
            },
          ],
        },
      },
    });
  }

  // --- CHECK Method (10 Items) ---
  console.log("Generating 10 CHECK Disbursements...");

  for (let i = 1; i <= 10; i++) {
    const randomFund = funds[getRandomInt(0, funds.length - 1)];
    const randomPayee = payees[getRandomInt(0, payees.length - 1)];
    const randomDate = getRandomDate(thisMonth, today);

    const gross = getRandomInt(5000, 20000); // Checks often smaller amounts
    const tax = 0; // Simple example with no tax
    const net = gross;

    const isPaid = true;
    const status = isPaid ? Status.PAID : Status.PENDING;

    await prisma.disbursement.create({
      data: {
        payeeId: randomPayee.id,
        fundSourceId: randomFund.id,

        // --- CHECK Specific Fields ---
        method: Method.CHECK,
        lddapMthd: null, // Not applicable
        lddapNum: null,
        checkNum: genCode("CHK"), // Required for Check method

        // --- Common Fields ---
        dateReceived: randomDate,
        dateEntered: new Date(),
        grossAmount: gross,
        totalDeductions: tax,
        netAmount: net,
        particulars: `Payment via Check - Batch ${i}`,
        status: status,
        approvedAt: isPaid ? new Date() : null,

        // --- Relations: References ---
        references: {
          create: {
            acicNum: "N/A", // Checks might not have ACIC
            orsNum: genCode("ORS"),
            dvNum: genCode("DV"),
            uacsCode: `5-02-${getRandomInt(10, 99)}-${getRandomInt(100, 999)}`,
            respCode: `19-001-03-${getRandomInt(100, 999)}`,
          },
        },

        items: {
          create: [
            {
              description: "Supply Purchase",
              amount: gross,
              accountCode: "5-02-03-010",
            },
          ],
        },
        // No deductions for this batch
      },
    });
  }

  //* --- Create Dummy Logs ---
  await prisma.logs.createMany({
    data: [
      { userId: encoder.id, log: "Created disbursement DV-2024-01-001" },
      { userId: staff.id, log: "Approved disbursement DV-2024-01-005" },
      { userId: admin.id, log: "Updated Fund Source GF-101 balance" },
      { userId: encoder.id, log: "Generated bulk seed data for testing" },
    ],
  });

  console.log("Logs created.");
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
