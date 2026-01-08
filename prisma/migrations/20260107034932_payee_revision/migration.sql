-- AlterTable
ALTER TABLE "payees" ADD COLUMN     "account_name" TEXT,
ADD COLUMN     "account_number" TEXT,
ADD COLUMN     "bank_branch" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "contact_person" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mobile_number" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "tin_number" TEXT;
