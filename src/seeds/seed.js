import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  //* Create Users:
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
      role: "STAFF", // Maps to 'APPROVER' in DB
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

  console.log("Users created.");

  //* Create Fund Sources:
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

  console.log("Fund Sources created.");

  //* Create Payees:
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
  ];

  const payees = [];
  for (const p of payeesData) {
    const payee = await prisma.payee.create({ data: p });
    payees.push(payee);
  }

  console.log("Payees created.");

  //* Create Disbursement with Items and Deductions:

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

  // Pending
  await prisma.disbursement.create({
    data: {
      payeeId: payees[2].id,
      fundSourceId: fund1.id,
      grossAmount: 25000.0,
      netAmount: 25000.0,
      totalDeductions: 0,
      particulars: "Electricity Bill for January 2024",
      status: "pending",
      method: "MANUAL",
      items: {
        create: [
          {
            description: "Electricity Bill Ref# 999111",
            amount: 25000.0,
            accountCode: "5-02-04-020",
          },
        ],
      },
    },
  });

  console.log("Disbursements created.");

  //* Create Dummy Logs
  await prisma.logs.createMany({
    data: [
      { userId: encoder.id, log: "Created disbursement DV-2024-01-001" },
      { userId: staff.id, log: "Approved disbursement DV-2024-01-005" },
      { userId: admin.id, log: "Updated Fund Source GF-101 balance" },
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
