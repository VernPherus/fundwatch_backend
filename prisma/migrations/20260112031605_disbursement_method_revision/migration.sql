/*
  Warnings:

  - The `method` column on the `disbursements` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Method" AS ENUM ('ONLINE', 'MANUAL');

-- AlterTable
ALTER TABLE "disbursements" DROP COLUMN "method",
ADD COLUMN     "method" "Method" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "disbursements_method_idx" ON "disbursements"("method");
