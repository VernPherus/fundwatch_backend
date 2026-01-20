-- CreateEnum
CREATE TYPE "Reset" AS ENUM ('MONTHLY', 'YEARLY', 'NONE');

-- AlterTable
ALTER TABLE "tb_fund_sources" ADD COLUMN     "reset" "Reset" NOT NULL DEFAULT 'NONE';
