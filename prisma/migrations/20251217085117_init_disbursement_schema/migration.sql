-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'APPROVER');

-- CreateTable
CREATE TABLE "payees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "type" TEXT DEFAULT 'supplier',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_sources" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fund_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursements" (
    "id" SERIAL NOT NULL,
    "payee_id" INTEGER,
    "fund_source_id" INTEGER,
    "lddap_num" TEXT,
    "acic_num" TEXT,
    "ors_num" TEXT,
    "dv_num" TEXT,
    "uacs_code" TEXT,
    "resp_code" TEXT,
    "date_received" TIMESTAMP(3),
    "date_entered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gross_amount" DECIMAL(15,2) NOT NULL,
    "total_deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2) NOT NULL,
    "particulars" TEXT,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursement_items" (
    "id" SERIAL NOT NULL,
    "disbursement_id" INTEGER,
    "description" TEXT NOT NULL,
    "account_code" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disbursement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursement_deductions" (
    "id" SERIAL NOT NULL,
    "disbursement_id" INTEGER NOT NULL,
    "deduction_type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disbursement_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fund_sources_code_key" ON "fund_sources"("code");

-- CreateIndex
CREATE INDEX "disbursements_lddap_num_idx" ON "disbursements"("lddap_num");

-- CreateIndex
CREATE INDEX "disbursements_acic_num_idx" ON "disbursements"("acic_num");

-- CreateIndex
CREATE INDEX "disbursements_ors_num_idx" ON "disbursements"("ors_num");

-- CreateIndex
CREATE INDEX "disbursements_dv_num_idx" ON "disbursements"("dv_num");

-- CreateIndex
CREATE INDEX "disbursements_uacs_code_idx" ON "disbursements"("uacs_code");

-- CreateIndex
CREATE INDEX "disbursements_resp_code_idx" ON "disbursements"("resp_code");

-- CreateIndex
CREATE INDEX "disbursements_method_idx" ON "disbursements"("method");

-- CreateIndex
CREATE INDEX "disbursements_status_idx" ON "disbursements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "payees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_fund_source_id_fkey" FOREIGN KEY ("fund_source_id") REFERENCES "fund_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement_items" ADD CONSTRAINT "disbursement_items_disbursement_id_fkey" FOREIGN KEY ("disbursement_id") REFERENCES "disbursements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement_deductions" ADD CONSTRAINT "disbursement_deductions_disbursement_id_fkey" FOREIGN KEY ("disbursement_id") REFERENCES "disbursements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
