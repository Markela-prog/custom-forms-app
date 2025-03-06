/*
  Warnings:

  - You are about to drop the column `salesforceUserId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "salesforceUserId",
ADD COLUMN     "salesforceConnectedAt" TIMESTAMP(3),
ADD COLUMN     "salesforceId" TEXT;
