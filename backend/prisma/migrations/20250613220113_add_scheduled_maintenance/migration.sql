-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ScheduledMaintenance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "maintenanceType" "MaintenanceType" NOT NULL,
    "assignedTechnician" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "reminderDays" INTEGER NOT NULL DEFAULT 1,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "suiteId" INTEGER NOT NULL,
    "hvacUnitId" INTEGER,
    "completedLogId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMaintenance_completedLogId_key" ON "ScheduledMaintenance"("completedLogId");

-- AddForeignKey
ALTER TABLE "ScheduledMaintenance" ADD CONSTRAINT "ScheduledMaintenance_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "Suite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMaintenance" ADD CONSTRAINT "ScheduledMaintenance_hvacUnitId_fkey" FOREIGN KEY ("hvacUnitId") REFERENCES "HvacUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMaintenance" ADD CONSTRAINT "ScheduledMaintenance_completedLogId_fkey" FOREIGN KEY ("completedLogId") REFERENCES "MaintenanceLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
