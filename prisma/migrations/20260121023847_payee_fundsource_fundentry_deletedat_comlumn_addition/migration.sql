-- AlterTable
ALTER TABLE "tb_fund_entry" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tb_fund_sources" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tb_payees" ADD COLUMN     "deleted_at" TIMESTAMP(3);
