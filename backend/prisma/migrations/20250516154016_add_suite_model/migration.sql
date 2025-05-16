/*
  Warnings:

  - You are about to drop the column `propertyId` on the `HvacUnit` table. All the data in the column will be lost.
  - You are about to drop the column `tenant` on the `HvacUnit` table. All the data in the column will be lost.
  - Added the required column `suiteId` to the `HvacUnit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HvacUnit" DROP CONSTRAINT "HvacUnit_propertyId_fkey";

-- AlterTable
ALTER TABLE "HvacUnit" DROP COLUMN "propertyId",
DROP COLUMN "tenant",
ADD COLUMN     "suiteId" INTEGER;

-- CreateTable
CREATE TABLE "Suite" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tenant" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" INTEGER NOT NULL,

    CONSTRAINT "Suite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Suite" ADD CONSTRAINT "Suite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HvacUnit" ADD CONSTRAINT "HvacUnit_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "Suite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
