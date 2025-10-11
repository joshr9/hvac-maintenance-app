-- Manual migration to add Task enums and update existing data
-- Run this on your production database

-- Step 1: Create the TaskStatus enum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- Step 2: Create the TaskPriority enum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Step 3: Add temporary columns with the new enum types
ALTER TABLE "tasks" ADD COLUMN "status_new" "TaskStatus";
ALTER TABLE "tasks" ADD COLUMN "priority_new" "TaskPriority";

-- Step 4: Migrate existing data (handle both lowercase and uppercase variants)
UPDATE "tasks"
SET "status_new" = CASE
  WHEN LOWER(status) = 'pending' THEN 'PENDING'::"TaskStatus"
  WHEN LOWER(status) IN ('in-progress', 'in_progress') THEN 'IN_PROGRESS'::"TaskStatus"
  WHEN LOWER(status) = 'completed' THEN 'COMPLETED'::"TaskStatus"
  ELSE 'PENDING'::"TaskStatus"  -- Default fallback
END;

UPDATE "tasks"
SET "priority_new" = CASE
  WHEN LOWER(priority) = 'low' THEN 'LOW'::"TaskPriority"
  WHEN LOWER(priority) = 'medium' THEN 'MEDIUM'::"TaskPriority"
  WHEN LOWER(priority) = 'high' THEN 'HIGH'::"TaskPriority"
  WHEN LOWER(priority) = 'urgent' THEN 'URGENT'::"TaskPriority"
  ELSE 'MEDIUM'::"TaskPriority"  -- Default fallback
END;

-- Step 5: Drop old columns
ALTER TABLE "tasks" DROP COLUMN "status";
ALTER TABLE "tasks" DROP COLUMN "priority";

-- Step 6: Rename new columns to original names
ALTER TABLE "tasks" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "tasks" RENAME COLUMN "priority_new" TO "priority";

-- Step 7: Set defaults on the new columns
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"TaskStatus";
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM'::"TaskPriority";

-- Step 8: Make columns NOT NULL (they should already have values from the migration)
ALTER TABLE "tasks" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "priority" SET NOT NULL;
