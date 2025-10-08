-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "channelId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN "directRecipientId" TEXT;
