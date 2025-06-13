-- AlterEnum
ALTER TYPE "MaintenanceType" ADD VALUE 'FULL_INSPECTION_CHECKLIST';

-- AlterTable
ALTER TABLE "MaintenanceLog" ADD COLUMN     "checklistData" JSONB,
ADD COLUMN     "serviceTechnician" TEXT,
ADD COLUMN     "specialNotes" TEXT;
