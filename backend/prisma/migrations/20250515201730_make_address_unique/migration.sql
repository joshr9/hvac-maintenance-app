/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Property_address_key" ON "Property"("address");
