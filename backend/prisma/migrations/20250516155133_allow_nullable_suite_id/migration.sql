/*
  Warnings:

  - A unique constraint covering the columns `[name,propertyId]` on the table `Suite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Suite_name_propertyId_key" ON "Suite"("name", "propertyId");
