-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('BEFORE', 'DURING', 'AFTER', 'PROBLEM', 'SOLUTION', 'GENERAL');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('HVAC', 'CLEANING', 'LANDSCAPING', 'SNOW_REMOVAL', 'ELECTRICAL', 'PLUMBING', 'INSPECTIONS', 'MAINTENANCE', 'OTHER');

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "scheduledTime" TEXT,
    "estimatedDuration" INTEGER,
    "assignedTechnician" TEXT,
    "technicianId" INTEGER,
    "propertyId" INTEGER NOT NULL,
    "suiteId" INTEGER,
    "hvacUnitId" INTEGER,
    "workType" TEXT NOT NULL,
    "maintenanceType" "MaintenanceType",
    "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "JobStatus" NOT NULL DEFAULT 'SCHEDULED',
    "estimatedCost" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "laborHours" DECIMAL(5,2),
    "laborRate" DECIMAL(8,2),
    "totalCost" DECIMAL(10,2),
    "totalPrice" DECIMAL(10,2),
    "profitMargin" DECIMAL(5,2),
    "primaryService" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerNotes" TEXT,
    "technicianNotes" TEXT,
    "internalNotes" TEXT,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_materials" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(8,2),
    "totalCost" DECIMAL(10,2),
    "supplier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_time_entries" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "technicianName" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER,
    "hourlyRate" DECIMAL(8,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_photos" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "photoType" "PhotoType" NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "unitCost" DECIMAL(10,2),
    "bookable" BOOLEAN NOT NULL DEFAULT false,
    "durationMinutes" INTEGER,
    "quantityEnabled" BOOLEAN NOT NULL DEFAULT true,
    "minimumQuantity" DECIMAL(10,2),
    "maximumQuantity" DECIMAL(10,2),
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_line_items" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "serviceName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2),
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2),
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "propertyId" INTEGER,
    "estimatedDuration" INTEGER,
    "estimatedCost" DECIMAL(10,2),
    "estimatedPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_template_services" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "job_template_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_jobNumber_key" ON "jobs"("jobNumber");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "Suite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hvacUnitId_fkey" FOREIGN KEY ("hvacUnitId") REFERENCES "HvacUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_materials" ADD CONSTRAINT "job_materials_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_time_entries" ADD CONSTRAINT "job_time_entries_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_line_items" ADD CONSTRAINT "job_line_items_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_line_items" ADD CONSTRAINT "job_line_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_templates" ADD CONSTRAINT "job_templates_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_template_services" ADD CONSTRAINT "job_template_services_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "job_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_template_services" ADD CONSTRAINT "job_template_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
