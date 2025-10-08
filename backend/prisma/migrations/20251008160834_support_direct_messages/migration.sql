-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "channelId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "directRecipientId" TEXT;
