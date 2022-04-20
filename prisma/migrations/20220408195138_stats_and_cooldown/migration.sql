-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastQuest" TIMESTAMP(3) NOT NULL DEFAULT '1970-01-01 00:00:00 +00:00',
ADD COLUMN     "totalQuests" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Statistics" (
    "id" INTEGER NOT NULL,
    "commands" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Statistics_pkey" PRIMARY KEY ("id")
);
