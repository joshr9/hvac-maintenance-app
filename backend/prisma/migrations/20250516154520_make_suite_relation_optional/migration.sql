-- DropForeignKey
ALTER TABLE "HvacUnit" DROP CONSTRAINT "HvacUnit_suiteId_fkey";

-- AddForeignKey
ALTER TABLE "HvacUnit" ADD CONSTRAINT "HvacUnit_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "Suite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
