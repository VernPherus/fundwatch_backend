-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'APPROVER');

-- CreateEnum
CREATE TYPE "Method" AS ENUM ('LDDAP', 'CHECK');

-- CreateEnum
CREATE TYPE "PayeeType" AS ENUM ('SUPPLIER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "LddapMethod" AS ENUM ('ONLINE', 'MANUAL');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PAID', 'PENDING');

-- CreateTable
CREATE TABLE "tb_payees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "type" TEXT DEFAULT 'supplier',
    "tin_number" TEXT,
    "bank_name" TEXT,
    "bank_branch" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "contact_person" TEXT,
    "mobile_number" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_payees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_fund_sources" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_fund_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_fund_entry" (
    "id" SERIAL NOT NULL,
    "fund_source_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_fund_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_references" (
    "id" SERIAL NOT NULL,
    "disbursement_id" INTEGER NOT NULL,
    "acic_num" TEXT NOT NULL,
    "ors_num" TEXT NOT NULL,
    "dv_num" TEXT NOT NULL,
    "uacs_code" TEXT NOT NULL,
    "resp_code" TEXT NOT NULL,

    CONSTRAINT "tb_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_disbursements" (
    "id" SERIAL NOT NULL,
    "payee_id" INTEGER,
    "fund_source_id" INTEGER,
    "lddap_num" TEXT,
    "checkNum" TEXT,
    "date_received" TIMESTAMP(3) NOT NULL,
    "date_entered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gross_amount" DECIMAL(15,2) NOT NULL,
    "total_deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2) NOT NULL,
    "particulars" TEXT,
    "method" "Method",
    "lddapMthd" "LddapMethod",
    "status" "Status" NOT NULL DEFAULT 'PAID',
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "ageLimit" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "tb_disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_disbursement_items" (
    "id" SERIAL NOT NULL,
    "disbursement_id" INTEGER,
    "description" TEXT NOT NULL,
    "account_code" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_disbursement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_disbursement_deductions" (
    "id" SERIAL NOT NULL,
    "disbursement_id" INTEGER NOT NULL,
    "deduction_type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_disbursement_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_fund_sources_code_key" ON "tb_fund_sources"("code");

-- CreateIndex
CREATE INDEX "tb_references_acic_num_ors_num_dv_num_uacs_code_resp_code_idx" ON "tb_references"("acic_num", "ors_num", "dv_num", "uacs_code", "resp_code");

-- CreateIndex
CREATE INDEX "tb_disbursements_status_method_lddap_num_idx" ON "tb_disbursements"("status", "method", "lddap_num");

-- CreateIndex
CREATE INDEX "tb_otp_email_otp_idx" ON "tb_otp"("email", "otp");

-- CreateIndex
CREATE UNIQUE INDEX "tb_users_email_key" ON "tb_users"("email");

-- AddForeignKey
ALTER TABLE "tb_fund_entry" ADD CONSTRAINT "tb_fund_entry_fund_source_id_fkey" FOREIGN KEY ("fund_source_id") REFERENCES "tb_fund_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_references" ADD CONSTRAINT "tb_references_disbursement_id_fkey" FOREIGN KEY ("disbursement_id") REFERENCES "tb_disbursements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_disbursements" ADD CONSTRAINT "tb_disbursements_fund_source_id_fkey" FOREIGN KEY ("fund_source_id") REFERENCES "tb_fund_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_disbursements" ADD CONSTRAINT "tb_disbursements_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "tb_payees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_disbursement_items" ADD CONSTRAINT "tb_disbursement_items_disbursement_id_fkey" FOREIGN KEY ("disbursement_id") REFERENCES "tb_disbursements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_disbursement_deductions" ADD CONSTRAINT "tb_disbursement_deductions_disbursement_id_fkey" FOREIGN KEY ("disbursement_id") REFERENCES "tb_disbursements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_logs" ADD CONSTRAINT "tb_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tb_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
