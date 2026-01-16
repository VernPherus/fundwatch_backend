import { prisma } from "../lib/prisma.js";
import "dotenv/config";
import bcrypt from "bcryptjs";

// Ensure we connect using the environment variable
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper to generate a random date between start and end
function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper to get random integer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Starting database seed...");

  // --- 1. Create Users ---
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
      role: "ADMIN",
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
      role: "STAFF",
    },
  });

  const encoder = await prisma.user.upsert({
    where: { email: "encoder@fundwatch.com" },
    update: {},
    create: {
      username: "encoder_user",
      firstName: "Data",
      lastName: "Encoder",
      email: "encoder@fundwatch.com",
      password: passwordHash,
      role: "USER",
    },
  });

  console.log("✅ Users created.");

  // --- 2. Create Fund Sources ---
  const fund1 = await prisma.fundSource.upsert({
    where: { code: "GF-101" },
    update: {},
    create: {
      code: "GF-101",
      name: "General Fund 2024",
      initialBalance: 5000000.0,
      description: "Main operational fund for fiscal year 2024",
    },
  });

  const fund2 = await prisma.fundSource.upsert({
    where: { code: "TF-202" },
    update: {},
    create: {
      code: "TF-202",
      name: "Trust Fund - Calamity",
      initialBalance: 1500000.0,
      description: "Dedicated fund for emergency response",
    },
  });

  const fund3 = await prisma.fundSource.upsert({
    where: { code: "DF-303" },
    update: {},
    create: {
      code: "DF-303",
      name: "Development Fund",
      initialBalance: 3000000.0,
      description: "Infrastructure and development projects",
    },
  });

  const funds = [fund1, fund2, fund3];
  console.log("✅ Fund Sources created.");

  // --- 3. Create Payees ---
  // Note: Using upsert logic manually since name isn't unique in schema,
  // but good for seeding to prevent duplicates
  const payeesData = [
    {
      name: "Acme Office Supplies",
      address: "123 Business St, City Center",
      tinNum: "123-456-789-000",
      bankName: "Landbank",
      accountNumber: "1111-2222-33",
      contactPerson: "John Doe",
      type: "supplier",
    },
    {
      name: "BuildRight Construction",
      address: "45 Industrial Ave, West Sector",
      tinNum: "987-654-321-000",
      bankName: "BDO",
      accountNumber: "5555-6666-77",
      contactPerson: "Jane Smith",
      type: "contractor",
    },
    {
      name: "PowerGrid Corp",
      address: "99 Utility Road",
      tinNum: "444-555-666-000",
      type: "utility",
      remarks: "Monthly electricity bill provider",
    },
    {
      name: "TechSolutions Inc",
      address: "88 Cyberzone, IT Park",
      tinNum: "555-444-333-222",
      bankName: "BPI",
      accountNumber: "9988-7766-55",
      contactPerson: "Mark Zuckerberg",
      type: "supplier",
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

  console.log("✅ Payees created.");

  // --- 4. Create Specific Manual Disbursements ---

  // Pending
  await prisma.disbursement.create({
    data: {
      payeeId: payees[0].id,
      fundSourceId: fund1.id,
      lddapNum: "LDDAP-2024-01-001",
      orsNum: "ORS-2024-01-001",
      dvNum: "DV-2024-01-001",
      grossAmount: 15000.0,
      netAmount: 14250.0,
      totalDeductions: 750.0,
      particulars: "Payment for office supplies for Q1",
      method: "MANUAL",
      status: "pending",
      // Specific date
      dateReceived: new Date("2024-01-15"),
      items: {
        create: [
          {
            description: "Bond Paper (A4)",
            amount: 5000.0,
            accountCode: "5-02-03-010",
          },
          {
            description: "Ink Cartridges",
            amount: 10000.0,
            accountCode: "5-02-03-010",
          },
        ],
      },
      deductions: {
        create: [{ deductionType: "Tax (5%)", amount: 750.0 }],
      },
    },
  });

  // Approved
  await prisma.disbursement.create({
    data: {
      payeeId: payees[1].id,
      fundSourceId: fund3.id,
      lddapNum: "LDDAP-2024-01-002",
      orsNum: "ORS-2024-01-005",
      dvNum: "DV-2024-01-005",
      grossAmount: 500000.0,
      netAmount: 475000.0,
      totalDeductions: 25000.0,
      particulars: "Partial payment for Brgy Hall renovation",
      method: "ONLINE",
      status: "approved",
      approvedAt: new Date(),
      dateReceived: new Date("2024-02-10"),
      items: {
        create: [
          { description: "Labor Cost (Partial)", amount: 200000.0 },
          { description: "Construction Materials", amount: 300000.0 },
        ],
      },
      deductions: {
        create: [{ deductionType: "Tax (5%)", amount: 25000.0 }],
      },
    },
  });

  //* 10 Random disbursements
  console.log("Generating 10 random disbursements...");

  for (let i = 1; i <= 10; i++) {
    // Randomly pick Fund and Payee
    const randomFund = funds[getRandomInt(0, funds.length - 1)];
    const randomPayee = payees[getRandomInt(0, payees.length - 1)];

    // Random Date within the last 6 months (approx 180 days)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(today.getDate() - 180);
    const randomDate = getRandomDate(sixMonthsAgo, today);

    // Random Money
    const randomGross = getRandomInt(5000, 75000);
    const taxAmount = Math.floor(randomGross * 0.05); // 5% Tax
    const netAmount = randomGross - taxAmount;

    // Random Status (70% Approved, 30% Pending)
    const isApproved = Math.random() > 0.3;
    const status = isApproved ? "approved" : "pending";
    const approvedAt = isApproved ? new Date() : null;

    await prisma.disbursement.create({
      data: {
        payeeId: randomPayee.id,
        fundSourceId: randomFund.id,
        // Generate unique-ish IDs
        lddapNum: `LDDAP-AUTO-${i}`,
        orsNum: `ORS-AUTO-${i}`,
        dvNum: `DV-AUTO-${i}`,
        uacsCode: `5-02-${getRandomInt(10, 99)}-${getRandomInt(100, 999)}`,

        // Financials
        grossAmount: randomGross,
        totalDeductions: taxAmount,
        netAmount: netAmount,

        particulars: `Generated Record #${i} - ${randomFund.code} payment`,
        method: Math.random() > 0.5 ? "ONLINE" : "MANUAL",
        status: status,
        approvedAt: approvedAt,

        dateReceived: randomDate,

        items: {
          create: [
            {
              description: "Miscellaneous Services/Goods",
              amount: randomGross,
              accountCode: `5-02-99-${getRandomInt(100, 999)}`,
            },
          ],
        },
        deductions: {
          create: [{ deductionType: "Withholding Tax", amount: taxAmount }],
        },
      },
    });
  }

  console.log("Disbursements created (including random generated ones).");

  //* Create Dummy Logs ---
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
