-- CreateTable
CREATE TABLE "MaintenancePhoto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "maintenanceLogId" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenancePhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintenancePhoto" ADD CONSTRAINT "MaintenancePhoto_maintenanceLogId_fkey" FOREIGN KEY ("maintenanceLogId") REFERENCES "MaintenanceLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
